import { useCallback } from 'react';
import { MODULE_IDS, COSTS, PERIODICITIES } from '../utils/quoteConstants';

export const useQuoteCalculator = (priceSchemes) => {

  const getPeriodicityMultiplier = (periodicityId) => {
    const p = PERIODICITIES.find(x => x.id === periodicityId);
    return p ? p.multiplier : 1; 
  };

  const calculateTotals = useCallback((formData) => {
    let {
      periodicity,        // Nuevo campo requerido
      discount,           // Nuevo campo (porcentaje simple, ej: 15)
      requiresStamps,
      numberOfExtraUsers,
      numberOfExtraRings,
      totalStamp,
      moduleDetails
    } = formData;

    // Valores por defecto y sanitización
    const currentPeriodicity = Number(periodicity) || 1;
    const currentDiscount = Number(discount) || 0;
    const multiplier = getPeriodicityMultiplier(currentPeriodicity);

    numberOfExtraUsers = Number(numberOfExtraUsers) || 0;
    numberOfExtraRings = Number(numberOfExtraRings) || 0;
    
    // --- Lógica processStamp (Integrada) ---
    // Copia profunda para no mutar el estado directamente
    const updatedModules = moduleDetails.map(m => ({ ...m })); 
    
    let calcTotalStamp = totalStamp;
    
    const nominaModule = updatedModules.find(m => m.moduleId === MODULE_IDS.NOMINA);
    
    // Regla: Si Nómina está activa y requiere timbres, se calculan. Si no, 0.
    if (nominaModule) {
        if (!nominaModule.isActive) {
             // Si el módulo se desactiva, Angular pone totalStamp a 0
             if (nominaModule.moduleId === MODULE_IDS.NOMINA) {
                 calcTotalStamp = 0;
             }
        } else if (requiresStamps) {
             calcTotalStamp = (Number(nominaModule.employeeNumber) || 0) * 5;
        } else {
             calcTotalStamp = 0;
        }
    }

    updatedModules.forEach(mod => {
        if (mod.moduleId === MODULE_IDS.NOMINA) {
             mod.stamp = calcTotalStamp;
        } else {
             mod.stamp = 0; 
        }
    });

    // --- Lógica processProductPriceScheme ---
    
    let moduleSupTotal = 0;
    let amountStamp = 0; // Total monetario de timbres
    
    // Cálculos de extras multiplicados por la periodicidad
    const amountExtraUsers = numberOfExtraUsers * COSTS.EXTRA_USER * multiplier;
    const amountExtraRings = numberOfExtraRings * COSTS.EXTRA_RING * multiplier;

    updatedModules.forEach(mod => {
        // Resetear si no está activo
        if (!mod.isActive) {
            mod.userNumberFree = 0;
            mod.stamp = 0;
            mod.price = 0;
            mod.totalPrice = 0; // En Angular usan 'totalPrice' en lugar de monthly/annual
            return;
        }

        // 1. Filtrar precios (resourceId fijo a NOMINA según lógica Angular)
        const prices = priceSchemes.filter(p => p.productId === mod.moduleId && p.resourceId === MODULE_IDS.NOMINA); 
        
        const empNum = Number(mod.employeeNumber) || 0;
        
        // 2. Encontrar el rango de precio
        let data = prices.sort((a, b) => a.resourceNumber - b.resourceNumber).find(x => x.resourceNumber >= empNum);

        if (!data && prices.length > 0) {
             // Si supera el máximo, toma el más alto disponible (lógica Angular .filter < empNum)
             data = prices
            .filter(x => x.resourceNumber < empNum)
            .sort((a, b) => b.resourceNumber - a.resourceNumber)[0];
        }

        // 3. Buscar precio de usuarios incluidos (userNumberFree)
        const userPrice = data ? priceSchemes.find(p => p.productId === mod.moduleId && p.parentId === data.id) : null;

        const unitPrice = data?.unitPrice ?? 0;
        
        // 4. Calcular totales del módulo
        const baseMonthlyPrice = Math.round(unitPrice * empNum * 100) / 100;
        const totalPrice = Math.round(baseMonthlyPrice * multiplier * 100) / 100;

        moduleSupTotal += totalPrice;

        mod.userNumberFree = userPrice?.resourceNumber ?? 0;
        mod.price = unitPrice;
        mod.totalPrice = totalPrice;
    });

    // Calcular el monto total de los timbres (Precio timbre * cantidad * periodicidad ???)
    // NOTA: En el código Angular: amountStamp = totalStamp * multiplier;
    // Esto asume que 'totalStamp' ya es un valor monetario O que el costo por stamp es implícito.
    // Revisando el Angular: "totalStamp = module.employeeNumber * 5". Ese '5' parece ser precio.
    // Entonces totalStamp es $$$, no cantidad.
    amountStamp = calcTotalStamp * multiplier;

    // --- Totales Finales ---
    const amountDiscount = moduleSupTotal * (currentDiscount / 100);
    
    const subTotal = (moduleSupTotal + amountStamp + amountExtraUsers + amountExtraRings) - amountDiscount;
    
    const iva = Math.round(subTotal * 0.16 * 100) / 100;
    const total = Math.round((subTotal + iva) * 100) / 100;

    return {
        ...formData,
        moduleDetails: updatedModules,
        
        // Valores calculados
        moduleSupTotal,
        amountDiscount,
        amountStamp,
        amountExtraUsers,
        amountExtraRings,
        
        // Totales finales de la cotización
        subTotal,
        iva,
        total,
        
        // Mantener estado de stamps
        totalStamp: calcTotalStamp,
        requiresStamps
    };

  }, [priceSchemes]);

  // Calculadora de Hardware (Sin cambios mayores, solo asegurando consistencia)
  const calculateProducts = useCallback((productDetails) => {
      let subTotal = 0;
      const updatedProducts = productDetails.map(p => {
          const qty = Number(p.quantity) || 0;
          const price = Number(p.price) || 0;
          const total = qty * price;
          subTotal += total;
          return { ...p, total };
      });

      const iva = subTotal * 0.16;
      const total = subTotal + iva;

      return {
          productDetails: updatedProducts,
          subTotalProducts: subTotal,
          ivaProducts: iva,
          totalProducts: total
      };
  }, []);

  return { calculateTotals, calculateProducts, getPeriodicityMultiplier };
};