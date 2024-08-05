import axios from 'axios';
import moment from "moment/moment.js";

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

export async function getDataFromLocalOrApi(localStorageKey, apiEndpoint, params) {
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

    // Check local storage for existing data
    const storedItem = localStorage.getItem(localStorageKey);

    if (storedItem && !storedItem.includes('Error: missing query')) {
        const {data, timestamp} = JSON.parse(storedItem);
        const age = Date.now() - new Date(timestamp).getTime();

        if (age < oneDay) {
            // If the data is less than one day old, return it
            return data;
        } else {
            // If the data is older than one day, remove it from local storage
            localStorage.removeItem(localStorageKey);
        }
    }

    try {
        // Fetch data from the API endpoint
        const response = await axios.get(apiEndpoint, {
            params,
            headers: {
                Accept: 'application/vnd.api+json',
            }
        });
        const data = response.data;

        // Save the data and current timestamp to local storage
        const newItem = {
            data,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(localStorageKey, JSON.stringify(newItem));

        // Return the data
        return data;
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return null;
    }
}
