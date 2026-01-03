export const MODULE_IDS = {
  RH: "lK20zbAk4JRDVEa1",
  NOMINA: "NZ9DezJWqMQOnRE3",
  PRENOMINA: "b93BVzJ3zAZelEd7"
};

export const INITIAL_MODULES = [
  {
    moduleId: MODULE_IDS.RH,
    name: 'Recursos Humanos',
    employeeNumber: 60,
    userNumberFree: 0,
    stamp: 0,
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    isActive: true
  },
  {
    moduleId: MODULE_IDS.NOMINA,
    name: 'Nómina',
    employeeNumber: 0,
    userNumberFree: 0,
    stamp: 0,
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    isActive: false
  },
  {
    moduleId: MODULE_IDS.PRENOMINA,
    name: 'Pre-Nómina',
    employeeNumber: 0,
    userNumberFree: 0,
    stamp: 0,
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    isActive: false
  }
];

export const HARDCODED_PRODUCTS = [
  { id: 1, name: 'ZKTECO Horus E1', price: 7974.14  },
  { id: 7, name: 'Hikvision DSK1T343MWX', price: 2500 },
  { id: 2, name: 'ZKTECO SpeedFace V5LP', price: 6887.93 },
  { id: 3, name: 'ZKTECO SpeedFace V5LPWIFI', price: 6887.93 },
  { id: 4, name: 'ZKTECO MB10VL', price: 2370.69 },
  { id: 5, name: 'Batería de Respaldo Mini', price: 1206.032},
  { id: 6, name: 'Plan Datos Renta Mensual Tarjeta SIM Telcel', price: 150 },
  { id: 8, name: 'DAHUA DHI-ASI3214A-W (FIJO)', price: 3500 },
  { id: 9, name: 'DAHUA DHI-ASI3214A-W (PORTATIL)', price: 4500 },
];

export const COSTS = {
  EXTRA_USER: 55,
  EXTRA_RING: 1
};