export interface TeamLeader {
  name: string;
  role: string;
  image: string;
  primary?: boolean;
}

export const leadershipTeam: TeamLeader[] = [
  {
    name: "Rakesh Mahto",
    role: "राष्ट्रीय अध्यक्ष",
    image: "/images/leaders/rakesh-mahto.jpeg",
    primary: true,
  },
  {
    name: "Neeraj Kushwaha",
    role: "Sangrakshak",
    image: "/images/leaders/neeraj.jpeg",
  },
  {
    name: "Arun Kushwaha (Kannauj wale Sir)",
    role: "जिलाध्यक्ष कानपुर नगर",
    image: "/images/leaders/arun.jpeg",
  },
];
