import { useCallback } from 'react';
import { MODULE_IDS, COSTS } from '../utils/quoteConstants';

export const useQuoteCalculator = (priceSchemes) => {

  const calculateTotals = useCallback((formData) => {
    let {
      anualDiscount,
      monthlyDiscount,
      requiresStamps,
      numberOfExtraUsers,
      numberOfExtraRings,
      totalStamp,
      moduleDetails
    } = formData;

    // Asegurar valores numéricos
    anualDiscount = Number(anualDiscount) || 0;
    monthlyDiscount = Number(monthlyDiscount) || 0;
    numberOfExtraUsers = Number(numberOfExtraUsers) || 0;
    numberOfExtraRings = Number(numberOfExtraRings) || 0;
    
    // Lógica processStamp (integrada)
    const updatedModules = moduleDetails.map(m => ({ ...m })); // Copia profunda para no mutar directo
    
    // Paso 1: Calcular Timbrado (Stamps)
    let calcTotalStamp = totalStamp;
    
    // Si Nómina está activa y requiere timbres
    const nominaModule = updatedModules.find(m => m.moduleId === MODULE_IDS.NOMINA);
    
    if (nominaModule) {
        if (!nominaModule.isActive) {
            calcTotalStamp = 0;
            // Si Nómina se apaga, requiresStamps podría resetearse según lógica de negocio, 
            // pero el Angular solo pone totalStamp a 0 si es Nómina inactiva
        } else if (requiresStamps) {
             calcTotalStamp = (Number(nominaModule.employeeNumber) || 0) * 5;
        } else {
             calcTotalStamp = 0;
        }
    }

    // Actualizar stamps en módulos
    updatedModules.forEach(mod => {
        if (mod.moduleId === MODULE_IDS.NOMINA) {
             mod.stamp = calcTotalStamp;
        } else {
             mod.stamp = 0; // Solo nómina lleva stamps en la lógica actual
        }
    });

    // Paso 2: Calcular Precios de Módulos (processProductPriceScheme)
    let pricePerEmployee = 0;
    let moduleSupTotalMonthly = 0;
    let moduleSupTotalAnual = 0;
    
    const amountExtraUsersMonthly = numberOfExtraUsers * COSTS.EXTRA_USER;
    const amountExtraUsersAnual = amountExtraUsersMonthly * 12;
    const amountExtraRingsMonthly = numberOfExtraRings * COSTS.EXTRA_RING;
    const amountExtraRingsAnual = amountExtraRingsMonthly * 12;

    const amountStampMonthly = calcTotalStamp;
    const amountStampAnual = calcTotalStamp * 12;

    updatedModules.forEach(mod => {
        if (!mod.isActive) {
            mod.userNumberFree = 0;
            mod.monthlyPrice = 0;
            mod.annualPrice = 0;
            return;
        }

        // Buscar esquema de precios
        // Filtro por productId (moduleId) y resourceId fijo del código Angular ("NZ9DezJWqMQOnRE3")? 
        // NOTA: El código Angular usa hardcoded "NZ9DezJWqMQOnRE3" como resourceId para filtrar precios base.
        // Asumiremos que esa lógica se mantiene.
        
        const prices = priceSchemes.filter(p => p.productId === mod.moduleId && p.resourceId === MODULE_IDS.NOMINA); 
        
        // Encontrar el rango correcto basado en employeeNumber
        const empNum = Number(mod.employeeNumber) || 0;
        
        let data = prices.sort((a, b) => a.resourceNumber - b.resourceNumber).find(x => x.resourceNumber >= empNum);

        if (!data && prices.length > 0) {
            // Si supera el máximo, toma el más alto
             data = prices
            .filter(x => x.resourceNumber < empNum)
            .sort((a, b) => b.resourceNumber - a.resourceNumber)[0];
        }

        // Buscar precio de usuario extra incluido (userNumberFree)
        // El Angular busca: productId === module.id && parentId === data.id
        const userPrice = data ? priceSchemes.find(p => p.productId === mod.moduleId && p.parentId === data.id) : null;

        if (mod.moduleId === MODULE_IDS.RH) {
            pricePerEmployee = data?.unitPrice ?? 0;
        }

        const unitPrice = data?.unitPrice ?? 0;
        const monthlyPrice = Math.round(unitPrice * empNum * 100) / 100;
        const annualPrice = Math.round(monthlyPrice * 12 * 100) / 100;

        moduleSupTotalMonthly += monthlyPrice;
        moduleSupTotalAnual += annualPrice;

        mod.userNumberFree = userPrice?.resourceNumber ?? 0;
        mod.monthlyPrice = monthlyPrice;
        mod.annualPrice = annualPrice;
        mod.price = unitPrice;
    });

    // Paso 3: Descuentos y Totales Finales
    const amountDiscountAnual = moduleSupTotalAnual * (anualDiscount / 100);
    const amountDiscountMonthly = moduleSupTotalMonthly * (monthlyDiscount / 100);

    const subTotalMonthly = (moduleSupTotalMonthly + amountStampMonthly + amountExtraUsersMonthly + amountExtraRingsMonthly) - amountDiscountMonthly;
    const subTotalAnual = (moduleSupTotalAnual + amountStampAnual + amountExtraUsersAnual + amountExtraRingsAnual) - amountDiscountAnual;

    const ivaMonthly = Math.round(subTotalMonthly * 0.16 * 100) / 100;
    const ivaAnual = Math.round(subTotalAnual * 0.16 * 100) / 100;
    
    const totalMonthly = Math.round((subTotalMonthly + ivaMonthly) * 100) / 100;
    const totalAnual = Math.round((subTotalAnual + ivaAnual) * 100) / 100;

    return {
        ...formData,
        moduleDetails: updatedModules, // Módulos con precios actualizados
        pricePerEmployee,
        moduleSupTotalMonthly,
        moduleSupTotalAnual,
        amountDiscountMonthly,
        amountDiscountAnual,
        amountStampMonthly,
        amountStampAnual,
        amountExtraUsersMonthly,
        amountExtraUsersAnual,
        amountExtraRingsMonthly,
        amountExtraRingsAnual,
        subTotalMonthly,
        subTotalAnual,
        ivaMonthly,
        ivaAnual,
        totalMonthly,
        totalAnual,
        totalStamp: calcTotalStamp
    };

  }, [priceSchemes]);

  // Calculadora separada para Productos (Hardware)
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

  return { calculateTotals, calculateProducts };
};