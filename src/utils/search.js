/**
 * Normaliza un string para búsqueda:
 * - Elimina acentos/tildes
 * - Convierte a minúsculas
 * - Elimina espacios extra
 */
export const normalize = (str) => {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')                    // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')     // Elimina los diacríticos
    .replace(/\s+/g, ' ')               // Colapsa espacios múltiples
    .trim();
};

/**
 * Verifica si un texto contiene el query normalizado.
 */
const matchesQuery = (text, normalizedQuery) =>
  normalize(text).includes(normalizedQuery);

/**
 * Filtra clientes (demos, activos, inactivos) por query.
 * Busca en: businessName, name, alias, phoneNumber
 */
export const filterClients = (clients, query) => {
  if (!query || query.trim() === '') return clients;
  const nq = normalize(query);

  return clients.filter((item) =>
    matchesQuery(item.businessName, nq) ||
    matchesQuery(item.name, nq) ||
    matchesQuery(item.alias, nq) ||
    matchesQuery(item.phoneNumber, nq)
  );
};

/**
 * Filtra cotizaciones por query.
 * Busca en: clientName, companyName, folio, employeeName
 */
export const filterQuotes = (quotes, query) => {
  if (!query || query.trim() === '') return quotes;
  const nq = normalize(query);

  return quotes.filter((item) =>
    matchesQuery(item.clientName, nq) ||
    matchesQuery(item.companyName, nq) ||
    matchesQuery(item.folio, nq) ||
    matchesQuery(item.employeeName, nq)
  );
};