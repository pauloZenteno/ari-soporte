export const AdminRoleEnum = {
    SuperAdmin: 'lK20zbAk4JRDVEa1',
    Admin: 'NZ9DezJWqMQOnRE3',
    Developer: 'gElXYKpQBM5DB3qv',
    Seller: 'B9oQdeA10Mvl1Waw',
    Support: 'vYjl7bMw8AaZLGBd',
    Collection: 'b93BVzJ3zAZelEd7',
    AuxCollection: '5m2XOBMXzJ4NZkwr'
};

// 1. Centralizamos toda la información en un solo arreglo
const SELLERS_DATA = [
    {
        numericId: 1,
        sellerId: 'lK20zbAk4JRDVEa1', 
        userId: '5m2XOBMXzJ4NZkwr',
        name: 'Ana Paola Valle',
        phone: '9993282168' 
    },
    {
        numericId: 2,
        sellerId: 'NZ9DezJWqMQOnRE3',
        userId: 'b8QWwNJYxAGr5gER',
        name: 'Karen Giffard',
        phone: '9992716915' 
    },
    {
        numericId: 3,
        sellerId: 'gElXYKpQBM5DB3qv', // Búscalo en la respuesta completa de tu JSON
        userId: 'b93BVzJ3zAZelEd7',          // Tu id principal del JSON
        name: 'Paulo Zenteno',
        phone: '99916638553'      // Tu número
    }
];

// 2. Exportamos los objetos vacíos que llenaremos dinámicamente
export const SELLER_MAP = {};
export const SELLER_PHONES = {};
export const SELLER_OPTIONS = [];

// 3. Generamos los mapas automáticamente iterando una sola vez
SELLERS_DATA.forEach(seller => {
    // Genera el SELLER_MAP compatible con los IDs alfanuméricos y numéricos
    SELLER_MAP[seller.sellerId] = seller.name;
    SELLER_MAP[seller.numericId] = seller.name;
    SELLER_MAP[seller.numericId.toString()] = seller.name;

    // Genera el mapa de teléfonos ligado al ID principal del usuario
    SELLER_PHONES[seller.userId] = seller.phone;

    // Genera las opciones para tus Dropdowns / Filtros
    SELLER_OPTIONS.push({ 
        id: seller.numericId, 
        name: seller.name, 
        sellerId: seller.sellerId 
    });
});