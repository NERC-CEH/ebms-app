import axios from 'axios';
import { Location } from '@flumens';
import config from 'common/config';

interface WeatherRemoteRes {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

type Weather = {
  cloud: number | null;
  temperature: number | string | null;
  windDirection: string | null;
  windSpeed: string | null;
};

type HistoricalWeatherData = {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  rain: {
    '1h': number;
  };
};

export interface HistoricalWeatherRemoteRes {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  data: HistoricalWeatherData[]
}

const url = config.weatherSiteUrl;

function getTemperature(tempFromService: string | number) {
  const temp = parseFloat(`${tempFromService}`);

  if (Number.isNaN(temp)) return null;

  const temperature = Math.round(temp);

  if (temperature < 0) return null;
  if (temperature > 39) return '40+';

  return temperature;
}

const getWindDirection = (degreesFromService: string | number) => {
  const degrees = parseFloat(`${degreesFromService}`);

  if (Number.isNaN(degrees) || degrees > 360) return null;

  if (degrees < 45) return 'N';
  if (degrees < 45 * 2) return 'NE';
  if (degrees < 45 * 3) return 'E';
  if (degrees < 45 * 4) return 'SE';
  if (degrees < 45 * 5) return 'S';
  if (degrees < 45 * 6) return 'SW';
  if (degrees < 45 * 7) return 'W';

  return 'NW';
};

const getWindSpeed = (speedFromService: string | number) => {
  const speed = parseFloat(`${speedFromService}`);

  if (Number.isNaN(speed)) return null;

  // Beaufort Wind Scale m/s
  if (speed < 0.4) return 'Smoke rises vertically';
  if (speed <= 1.3) return 'Slight smoke drift';
  if (speed <= 3.2) return 'Wind felt on face, leaves rustle';
  if (speed <= 5.3) return 'Leaves and twigs in slight motion';
  if (speed <= 8) return 'Dust raised and small branches move';
  if (speed <= 10.7) return 'Small trees in leaf begin to sway';

  return 'Large branches move and trees sway';
};

const getCloud = (cloudFromService: string | number) => {
  const cloud = parseFloat(`${cloudFromService}`);

  return Number.isNaN(cloud) ? null : Math.round(cloud);
};

export const fetchWeather = async ({
  latitude,
  longitude,
}: Location): Promise<Weather | Record<string, never>> => {
  try {
    const res = await axios(
      `${url}/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${config.weatherSiteApiKey}`
    );

    const normaliseResponseValues = ({
      main,
      wind,
      clouds,
    }: WeatherRemoteRes): Weather => ({
      temperature: getTemperature(main?.temp),
      windSpeed: getWindSpeed(wind?.speed),
      windDirection: getWindDirection(wind?.deg),
      cloud: getCloud(clouds?.all),
    });

    return normaliseResponseValues(res.data);
  } catch (error) {
    console.error(error);
  }

  return {};
};

export const fetchHistoricalWeather = async (
  { latitude, longitude }: Location,
  date: string
): Promise<Weather | Record<string, never>> => {
  const unixTimestamp = Math.floor(new Date(date).getTime() / 1000);

  try {
    const res = await axios<HistoricalWeatherRemoteRes>(
      `${url}/data/3.0/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${unixTimestamp}&appid=${config.weatherSiteApiKey}&only_current=true&units=metric`
    );

    const normaliseResponseValues = (current:HistoricalWeatherData): Weather => ({
      temperature: getTemperature(current?.temp),
      windSpeed: getWindSpeed(current?.wind_speed),
      windDirection: getWindDirection(current?.wind_deg),
      cloud: getCloud(current.clouds),
    });

    return normaliseResponseValues(res.data.data?.[0]);
  } catch (error) {
    console.error(error);
  }

  return {};
};
