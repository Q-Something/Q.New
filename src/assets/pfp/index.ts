
const profilePictures = [
  // Remove all references to pfp1.jpg, pfp2.jpg, pfp3.jpg, pfp4.jpg
];

export const getRandomProfilePicture = (): string => {
  const randomIndex = Math.floor(Math.random() * profilePictures.length);
  return profilePictures[randomIndex];
};

export default profilePictures;
