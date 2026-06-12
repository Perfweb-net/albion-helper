import axios from 'axios';

// API pour les données Albion Online Data
const albionDataApi = axios.create({
    baseURL: 'https://www.albion-online-data.com/api/v2',
    timeout: 10000,
});

// Endpoint pour rechercher des items
export const searchItems = async (query) => {
    try {
        // Utilisation de l'endpoint de recherche d'items
        const response = await albionDataApi.get(`/search`, {
            params: {
                q: query,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching items:', error);
        throw error;
    }
};

// Endpoint pour obtenir les prix d'un item
export const getItemPrices = async (itemId, locations = '', qualities = '') => {
    try {
        const response = await albionDataApi.get(`/stats/prices/${itemId}`, {
            params: {
                locations: locations,
                qualities: qualities,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching item prices:', error);
        throw error;
    }
};

// Endpoint pour obtenir les informations d'un item
export const getItemInfo = async (itemId) => {
    try {
        const response = await albionDataApi.get(`/item/${itemId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching item info:', error);
        throw error;
    }
};

// Fonction pour charger les données d'items depuis le repo GitHub
export const loadItemsData = async () => {
    try {
        // Essayer plusieurs endpoints possibles
        const endpoints = [
            'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json',
            'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/itemdata.json',
            'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items/items.json',
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(endpoint, {
                    timeout: 15000,
                });
                if (response.data) {
                    return response.data;
                }
            } catch (err) {
                console.log(`Failed to load from ${endpoint}, trying next...`);
            }
        }

        // Si aucun endpoint ne fonctionne, retourner des données de base
        return [];
    } catch (error) {
        console.error('Error loading items data:', error);
        return [];
    }
};

// Fonction pour rechercher des items par nom (utilise l'API Albion Data)
export const searchItemsByName = async (query) => {
    try {
        // L'API Albion Data peut avoir un endpoint de recherche
        // Sinon, on utilisera les données locales
        const response = await albionDataApi.get(`/search`, {
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        // Si l'endpoint n'existe pas, on retourne un tableau vide
        // La recherche se fera côté client
        return [];
    }
};

export default albionDataApi;


