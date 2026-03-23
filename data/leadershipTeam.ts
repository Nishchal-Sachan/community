export interface TeamLeader {
  name: string;
  role: string;
  image: string;
  primary?: boolean;
}

export const leadershipTeam: TeamLeader[] = [
  {
    name: "Rakesh Mahto",
    role: "Rashtriya Adhyaksh",
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
    role: "Jiladyaksh Kanpur Nagar",
    image: "/images/leaders/arun.jpeg",
  },
];
