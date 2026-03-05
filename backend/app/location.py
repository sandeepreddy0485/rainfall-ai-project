import requests


def search_location(query: str):
    """
    Search for locations using Nominatim (OpenStreetMap) API.
    
    Provides comprehensive coverage of:
    - All Indian cities, towns, villages, mandals, talukas
    - Better handling of ambiguous location names
    - Includes administrative divisions and importance ranking
    
    Fallback to Open-Meteo if Nominatim unavailable.
    """
    if not query:
        return {"error": "Empty query"}

    # Primary: Use Nominatim (OpenStreetMap) for better India coverage
    nominatim_url = "https://nominatim.openstreetmap.org/search"
    # Nominatim query with address details for more precise results (especially villages)
    nominatim_params = {
        "q": query,
        "countrycodes": "in",
        # increase limit so we can return more candidates including small villages
        "limit": 25,
        "format": "json",
        # return detailed address breakdown so we can pick village/hamlet names
        "addressdetails": 1,
        "accept-language": "en",
    }
    
    nominatim_headers = {
        "User-Agent": "RainCast AI Weather (rainfall prediction system)"
    }

    try:
        response = requests.get(
            nominatim_url, 
            params=nominatim_params, 
            timeout=10, 
            headers=nominatim_headers
        )

        if response.status_code == 200:
            data = response.json()

            if len(data) > 0:
                suggestions = []
                
                seen_coords = set()
                for location in data:
                    address = location.get("address", {})

                    # prefer the most specific named feature from the address breakdown
                    name = (
                        address.get("village")
                        or address.get("hamlet")
                        or address.get("town")
                        or address.get("city")
                        or location.get("name")
                        or query
                    )

                    country = address.get("country", "India")
                    state = address.get("state", "")
                    # district may be stored in county, state_district, or region
                    district = (
                        address.get("county")
                        or address.get("state_district")
                        or address.get("region")
                        or ""
                    )

                    # avoid duplicate coordinates
                    coord_key = (location.get("lat"), location.get("lon"))
                    if coord_key in seen_coords:
                        continue
                    seen_coords.add(coord_key)

                    # Build hierarchical display name always including state for clarity
                    parts = [name]
                    if district and district.lower() not in name.lower():
                        parts.append(district)
                    if state and state.lower() not in " ".join(parts).lower():
                        parts.append(state)
                    display_name = ", ".join(parts)

                    location_type = location.get("type", "")
                    importance = location.get("importance", 0)

                    suggestions.append({
                        "name": name,
                        "display_name": display_name,
                        "latitude": float(location.get("lat")),
                        "longitude": float(location.get("lon")),
                        "country": country,
                        "state": state,
                        "district": district,
                        "admin1": state,  # for frontend compatibility
                        "type": location_type,
                        "importance": importance,
                    })
                
                # Sort by importance and type priority
                type_priority = {
                    "city": 0,
                    "town": 1, 
                    "village": 2,
                    "hamlet": 3,
                    "administrative": 4
                }
                
                suggestions.sort(
                    key=lambda x: (
                        -x["importance"],
                        type_priority.get(x["type"], 99),
                    )
                )
                
                return {"results": suggestions}

    except Exception as e:
        print(f"Nominatim search failed: {e}. Falling back to Open-Meteo...")

    # Fallback: Use Open-Meteo if Nominatim fails
    try:
        fallback_url = "https://geocoding-api.open-meteo.com/v1/search"
        # ask for more results to catch villages
        fallback_params = {
            "name": query,
            "count": 20,
            "language": "en",
            "format": "json"
        }

        response = requests.get(fallback_url, params=fallback_params, timeout=5)

        if response.status_code == 200:
            data = response.json()

            if "results" in data and len(data["results"]) > 0:
                suggestions = []
                for r in data["results"]:
                    state_name = r.get("admin1") or ""
                    parts = [r.get("name") or ""]
                    if state_name:
                        parts.append(state_name)
                    if r.get("country"):
                        parts.append(r.get("country"))
                    suggestions.append({
                        "name": r.get("name"),
                        "display_name": ", ".join(parts),
                        "latitude": r.get("latitude"),
                        "longitude": r.get("longitude"),
                        "country": r.get("country"),
                        "state": state_name,
                        "district": "",
                        "admin1": state_name,
                        "type": "city",
                        "importance": 0.5,
                    })

                return {"results": suggestions}

    except Exception as e:
        print(f"Open-Meteo fallback also failed: {e}")

    return {"error": "Location not found - try a more specific name (e.g., 'Suryapet, Telangana')"}


def reverse_location(lat: float, lon: float):
    """Reverse geocode coordinates using Nominatim to give a structured suggestion."""
    nominatim_url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "addressdetails": 1,
        "accept-language": "en",
    }
    headers = {"User-Agent": "RainCast AI Weather (rainfall prediction system)"}
    try:
        response = requests.get(nominatim_url, params=params, timeout=10, headers=headers)
        if response.status_code == 200:
            data = response.json()
            address = data.get("address", {})
            name = (
                address.get("village")
                or address.get("hamlet")
                or address.get("town")
                or address.get("city")
                or data.get("name")
                or data.get("display_name")
            )
            country = address.get("country", "India")
            state = address.get("state", "")
            district = (
                address.get("county")
                or address.get("state_district")
                or address.get("region")
                or ""
            )
            parts = [name]
            if district and district.lower() not in name.lower():
                parts.append(district)
            if state and state.lower() not in " ".join(parts).lower():
                parts.append(state)
            display_name = ", ".join(parts)
            return {
                "name": name,
                "display_name": display_name,
                "latitude": float(lat),
                "longitude": float(lon),
                "country": country,
                "state": state,
                "district": district,
                "admin1": state,
                "type": data.get("type", ""),
                "importance": data.get("importance", 0),
            }
    except Exception as e:
        print(f"Reverse geocoding failed: {e}")
    return {"error": "Reverse lookup failed"}