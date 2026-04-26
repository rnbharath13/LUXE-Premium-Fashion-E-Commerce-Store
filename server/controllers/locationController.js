const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const pickComponent = (components, type) =>
  components.find((component) => component.types?.includes(type))?.long_name || '';

const buildAddress = (result, latitude, longitude) => {
  const components = result.address_components || [];
  const streetNumber = pickComponent(components, 'street_number');
  const route = pickComponent(components, 'route');
  const sublocality = pickComponent(components, 'sublocality') || pickComponent(components, 'sublocality_level_1');
  const neighborhood = pickComponent(components, 'neighborhood');

  const line1 = [streetNumber, route].filter(Boolean).join(' ').trim()
    || sublocality
    || neighborhood
    || result.formatted_address;

  return {
    line1,
    line2: '',
    city:       pickComponent(components, 'locality') || pickComponent(components, 'administrative_area_level_2'),
    state:      pickComponent(components, 'administrative_area_level_1'),
    postalCode: pickComponent(components, 'postal_code'),
    country:    pickComponent(components, 'country'),
    location: {
      latitude,
      longitude,
      formattedAddress: result.formatted_address,
      placeId: result.place_id || '',
      source: 'google_geocode',
    },
  };
};

export const reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(503).json({ error: 'Google Maps API key is not configured on the server' });
    }

    const url = new URL(GOOGLE_GEOCODE_URL);
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('language', 'en');

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status !== 'OK' || !data.results?.length) {
      return res.status(502).json({ error: data.error_message || 'Could not resolve your location' });
    }

    const best = data.results[0];
    res.json(buildAddress(best, Number(lat), Number(lng)));
  } catch (err) {
    next(err);
  }
};
