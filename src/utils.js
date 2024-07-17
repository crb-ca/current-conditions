export const toTitleCase = (str) => {
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .split(' ')    // Split the string into an array of words
    .map(word => {
      // Capitalize the first letter of each word and concatenate it with the rest of the word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');    // Join the array of words back into a single string
}