
const profilePictures = [
  '/src/assets/pfp/pfp1.jpg',
  '/src/assets/pfp/pfp2.jpg',
  '/src/assets/pfp/pfp3.jpg',
  '/src/assets/pfp/pfp4.jpg',
];

export const getRandomProfilePicture = (): string => {
  const randomIndex = Math.floor(Math.random() * profilePictures.length);
  return profilePictures[randomIndex];
};

export default profilePictures;
