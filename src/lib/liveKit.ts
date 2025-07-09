import { RoomServiceClient } from "livekit-server-sdk";


const livekitApiUrl = process.env.LIVEKIT_API_URL;
const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;


export const roomService = livekitApiUrl && livekitApiKey && livekitApiSecret
  ? new RoomServiceClient(livekitApiUrl, livekitApiKey, livekitApiSecret)
  : null;

export const isLiveKitAvailable = () => {
  return roomService !== null;
};
