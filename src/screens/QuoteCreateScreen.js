import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getProductPriceSchemes } from '../services/productPriceService';
import { getQuoteById, createQuote, updateQuote } from '../services/quoteService';
import { useQuoteCalculator } from '../hooks/useQuoteCalculator';
import { INITIAL_MODULES, HARDCODED_PRODUCTS, MODULE_IDS, PERIODICITIES } from '../utils/quoteConstants';
import * as SecureStore from 'expo-secure-store';
import { useClients } from '../context/ClientContext';
import { COLORS } from '../utils/colors';

const GeneralInfoTab = ({ data, onChange, onPeriodicityChange }) => {
    return (
        <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Datos del Cliente</Text>
            <TextInput style={styles.input} placeholder="Nombre de la Compañía *" value={data.companyName} onChangeText={(t) => onChange('companyName', t)} />
            <TextInput style={styles.input} placeholder="Nombre del Cliente *" value={data.clientName} onChangeText={(t) => onChange('clientName', t)} />
            <Text style={styles.sectionTitle}>Configuración de Cotización</Text>
            <Text style={styles.label}>Periodicidad</Text>
            <View style={styles.periodicityContainer}>
                {PERIODICITIES.map((p) => (
                    <TouchableOpacity 
                        key={p.id} 
                        style={[styles.periodicityBtn, data.periodicity === p.id && styles.periodicityBtnActive]}
                        onPress={() => onPeriodicityChange(p.id)}
                    >
                        <Text style={[styles.periodicityText, data.periodicity === p.id && styles.periodicityTextActive]}>
                            {p.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{height: 15}} />
            <Text style={styles.sectionTitle}>Datos del Vendedor</Text>
            <View style={styles.readOnlyContainer}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={data.employeeName} editable={false} />
                <View style={styles.row}>
                    <View style={{flex: 1, marginRight: 10}}>
                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput style={[styles.input, styles.disabledInput]} value={data.phone} editable={false} />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>Puesto</Text>
                        <TextInput style={[styles.input, styles.disabledInput]} value={data.jobPosition} editable={false} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const DescuentosTab = ({ data, onChange }) => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Descuentos</Text>
        <Text style={styles.helperTextGray}>El descuento se aplica automáticamente según la periodicidad, pero puedes modificarlo manualmente.</Text>
        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>Descuento General (%)</Text>
                <TextInput style={styles.input} value={data.discount?.toString()} onChangeText={(t) => onChange('discount', t)} keyboardType="numeric" placeholder="0" />
            </View>
            <View style={{flex: 1}} />
        </View>
    </View>
);

const ModulesTab = ({ data, onModuleChange, onGeneralChange }) => {
    const nominaModule = data.moduleDetails.find(m => m.moduleId === MODULE_IDS.NOMINA);
    const isNominaActive = nominaModule ? nominaModule.isActive : false;
    const currentPeriodicity = PERIODICITIES.find(p => p.id === data.periodicity) || PERIODICITIES[0];
    return (
        <ScrollView style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Módulos Contratados</Text>
            {data.moduleDetails.map((mod, index) => (
                <View key={mod.moduleId} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{mod.name}</Text>
                        <Switch value={mod.isActive} onValueChange={(val) => onModuleChange(index, 'isActive', val)} trackColor={{ false: "#767577", true: "#2b5cb5" }} />
                    </View>
                    {mod.isActive && (
                        <View style={styles.cardBody}>
                            <Text style={styles.label}>Número de Empleados</Text>
                            <TextInput style={styles.input} value={mod.employeeNumber?.toString()} onChangeText={(t) => onModuleChange(index, 'employeeNumber', t)} keyboardType="numeric" />
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Precio Unitario:</Text>
                                <Text style={styles.resultValue}>${mod.price?.toFixed(2)}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Total ({currentPeriodicity.description}):</Text>
                                <Text style={[styles.resultValue, {color: '#2b5cb5'}]}>${mod.totalPrice?.toFixed(2)}</Text>
                            </View>
                            {mod.stamp > 0 && (
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Timbres incluidos:</Text>
                                    <Text style={styles.resultValue}>{mod.stamp}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            ))}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Extras y Adicionales</Text>
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Usuarios Extra</Text>
                    <TextInput style={styles.input} value={data.numberOfExtraUsers?.toString()} onChangeText={(t) => onGeneralChange('numberOfExtraUsers', t)} keyboardType="numeric" />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Timbres Extra</Text>
                    <TextInput style={[styles.input, !data.requiresStamps && styles.disabledInput]} value={data.numberOfExtraRings?.toString()} onChangeText={(t) => onGeneralChange('numberOfExtraRings', t)} keyboardType="numeric" editable={data.requiresStamps} />
                </View>
            </View>
            <View style={styles.switchRow}>
                <View>
                    <Text style={styles.label}>¿Requiere Timbres?</Text>
                    {!isNominaActive && <Text style={styles.helperText}>Requiere módulo Nómina activo</Text>}
                </View>
                <Switch value={data.requiresStamps} onValueChange={(val) => onGeneralChange('requiresStamps', val)} trackColor={{ false: "#767577", true: "#2b5cb5" }} disabled={!isNominaActive} />
            </View>
            <View style={{height: 40}} />
        </ScrollView>
    );
};

const ProductsTab = ({ products, onProductChange }) => (
    <View style={styles.tabContent}>
        {products.map((prod, index) => (
            <View key={index} style={styles.productRow}>
                <View style={{flex: 1}}>
                    <Text style={styles.productName}>{prod.name}</Text>
                    <Text style={styles.productPrice}>${prod.price?.toFixed(2)}</Text>
                </View>
                <View style={{width: 80}}>
                    <TextInput style={styles.inputCentered} value={prod.quantity?.toString()} onChangeText={(t) => onProductChange(index, t)} keyboardType="numeric" placeholder="0" />
                </View>
            </View>
        ))}
        <View style={{height: 20}} />
    </View>
);

const SummaryTab = ({ data, onSave, saving }) => {
    const format = (n) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
    };
    const currentPeriodicity = PERIODICITIES.find(p => p.id === data.periodicity) || PERIODICITIES[0];
    return (
        <ScrollView style={styles.tabContent}>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>Resumen ({currentPeriodicity.description})</Text>
                <View style={styles.summaryRow}><Text>Módulos:</Text><Text>{format(data.moduleSupTotal)}</Text></View>
                <View style={styles.summaryRow}><Text>Usuarios Extra:</Text><Text>{format(data.amountExtraUsers)}</Text></View>
                <View style={styles.summaryRow}><Text>Timbres ({data.requiresStamps ? 'Sí' : 'No'}):</Text><Text>{format(data.amountStamp)}</Text></View>
                <View style={styles.summaryRow}><Text>Timbres Extra:</Text><Text>{format(data.amountExtraRings)}</Text></View>
                <View style={styles.summaryRow}>
                    <Text>Descuento ({data.discount}%):</Text>
                    <Text style={{color: 'red'}}>-{format(data.amountDiscount)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}><Text style={styles.bold}>Subtotal:</Text><Text style={styles.bold}>{format(data.subTotal)}</Text></View>
                <View style={styles.summaryRow}><Text>IVA (16%):</Text><Text>{format(data.iva)}</Text></View>
                <View style={[styles.summaryRow, {marginTop: 10}]}><Text style={styles.totalText}>Total:</Text><Text style={styles.totalText}>{format(data.total)}</Text></View>
            </View>
            {data.totalProducts > 0 && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryHeader}>Hardware / Productos</Text>
                    <View style={styles.summaryRow}><Text>Subtotal:</Text><Text>{format(data.subTotalProducts)}</Text></View>
                    <View style={styles.summaryRow}><Text>IVA:</Text><Text>{format(data.ivaProducts)}</Text></View>
                    <View style={[styles.summaryRow, {marginTop: 10}]}><Text style={styles.totalText}>Total Productos:</Text><Text style={styles.totalText}>{format(data.totalProducts)}</Text></View>
                </View>
            )}
            <View style={styles.grandTotalContainer}>
                <Text style={styles.grandTotalLabel}>VALOR TOTAL ESTIMADO</Text>
                <Text style={styles.grandTotalValue}>{format(data.total + data.totalProducts)}</Text>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#15c899" /> : (
                    <>
                        <Ionicons name="save-outline" size={20} color="#15c899" style={{marginRight: 8}} />
                        <Text style={styles.saveButtonText}>Guardar Cotización</Text>
                    </>
                )}
            </TouchableOpacity>
            <View style={{height: 40}} />
        </ScrollView>
    );
};

export default function QuoteCreateScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {}; 
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [schemes, setSchemes] = useState([]);
    const [activeTab, setActiveTab] = useState(0); 
    const { userProfile } = useClients(); 
    const { calculateTotals, calculateProducts } = useQuoteCalculator(schemes);
    const [form, setForm] = useState({
        id: '', employeeName: '', folio: '', email: '', phone: '', jobPosition: '',
        periodicity: 1, discount: 0, clientName: '', companyName: '', requiresStamps: false,
        numberOfExtraUsers: 0, numberOfExtraRings: 0, totalStamp: 0,
        moduleDetails: JSON.parse(JSON.stringify(INITIAL_MODULES)),
        productDetails: HARDCODED_PRODUCTS.map(p => ({ ...p, productId: p.id, quantity: 0, total: 0 })),
        moduleSupTotal: 0, amountDiscount: 0, amountStamp: 0, amountExtraUsers: 0, amountExtraRings: 0,
        subTotal: 0, iva: 0, total: 0, subTotalProducts: 0, ivaProducts: 0, totalProducts: 0
    });

    const recalculateAll = useCallback((currentForm) => {
        if (!schemes || schemes.length === 0) return currentForm;
        const calculatedModules = calculateTotals(currentForm);
        const calculatedProducts = calculateProducts(calculatedModules.productDetails);
        return { ...calculatedModules, ...calculatedProducts };
    }, [schemes, calculateTotals, calculateProducts]);

    useEffect(() => {
        const init = async () => {
            try {
                const priceSchemes = await getProductPriceSchemes();
                setSchemes(priceSchemes);
                if (id) {
                    const quoteData = await getQuoteById(id);
                    setForm(prev => {
                        const next = { ...prev, ...quoteData };
                        next.moduleDetails = INITIAL_MODULES.map(initMod => {
                             const serverMod = quoteData.moduleDetails?.find(m => m.moduleId === initMod.moduleId);
                             return serverMod ? { ...initMod, ...serverMod, name: initMod.name, isActive: serverMod.isActive } : initMod;
                        });
                        next.productDetails = HARDCODED_PRODUCTS.map(initProd => {
                            const serverProd = quoteData.productDetails?.find(p => p.productId === initProd.id);
                            return serverProd ? { ...initProd, ...serverProd, name: initProd.name, quantity: serverProd.quantity } : { ...initProd, productId: initProd.id, quantity: 0, total: 0 };
                        });
                        return next;
                    });
                } else {
                    let user = userProfile;
                    if (!user) {
                        const userInfoStr = await SecureStore.getItemAsync('userInfo');
                        if (userInfoStr) user = JSON.parse(userInfoStr);
                    }
                    if (user) {
                        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                        setForm(prev => ({ ...prev, employeeName: fullName, email: user.email || '', phone: user.phone || '', jobPosition: user.jobPosition || '' }));
                    }
                }
            } catch (error) { Alert.alert("Error", "No se pudieron cargar los datos necesarios."); }
            finally { setLoading(false); }
        };
        init();
    }, [id, userProfile]);

    useEffect(() => { if (schemes.length > 0 && !loading) setForm(prev => recalculateAll(prev)); }, [schemes, loading, recalculateAll]);

    const handlePeriodicityChange = (newPeriodicity) => {
        const pObj = PERIODICITIES.find(p => p.id === newPeriodicity);
        setForm(prev => recalculateAll({ ...prev, periodicity: newPeriodicity, discount: pObj ? pObj.defaultDiscount : 0 }));
    };

    const handleGeneralChange = (field, value) => setForm(prev => recalculateAll({ ...prev, [field]: value }));

    const handleModuleChange = (index, field, value) => {
        setForm(prev => {
            const newModules = [...prev.moduleDetails];
            newModules[index] = { ...newModules[index], [field]: value };
            if (field === 'isActive' && value === false && newModules[index].moduleId === MODULE_IDS.NOMINA) {
                 prev.requiresStamps = false; prev.numberOfExtraRings = 0;
            }
            return recalculateAll({ ...prev, moduleDetails: newModules });
        });
    };

    const handleProductChange = (index, value) => {
        setForm(prev => {
            const newProds = [...prev.productDetails];
            newProds[index] = { ...newProds[index], quantity: Number(value) || 0 };
            return recalculateAll({ ...prev, productDetails: newProds });
        });
    };

    const handleSave = async () => {
        if (!form.companyName || !form.clientName) { Alert.alert("Validación", "Compañía y Cliente son obligatorios."); return; }
        setSaving(true);
        try {
            const payload = { ...form, isActive: true };
            if (!id) { delete payload.id; delete payload.folio; delete payload.created; }
            payload.moduleDetails = payload.moduleDetails.map(m => { const { id: modId, quoteId, ...rest } = m; return { ...rest, employeeNumber: Number(m.employeeNumber) || 0, isActive: !!m.isActive }; });
            payload.productDetails = payload.productDetails.map(p => { const { id: prodId, quoteId, ...rest } = p; return { ...rest, productId: p.productId || p.id, quantity: Number(p.quantity) || 0, isActive: true }; });
            id ? await updateQuote(id, payload) : await createQuote(payload);
            Alert.alert("Éxito", id ? "Cotización actualizada" : "Cotización creada");
            navigation.goBack();
        } catch (error) { Alert.alert("Error", "No se pudo guardar la cotización."); }
        finally { setSaving(false); }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2b5cb5" /></View>;
    const tabs = ["Info", "Descuentos", "Módulos", "Hardware", "Resumen"];

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.actionBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={26} color="#111827" /></TouchableOpacity>
                <Text style={styles.headerTitle}>{id ? 'Editar Cotización' : 'Nueva Cotización'}</Text>
                <View style={{width: 26}} />
            </View>
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {tabs.map((tab, i) => (
                        <TouchableOpacity key={i} style={[styles.tabButton, activeTab === i && styles.tabButtonActive]} onPress={() => setActiveTab(i)}>
                            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <ScrollView style={styles.content}>
                {activeTab === 0 && <GeneralInfoTab data={form} onChange={handleGeneralChange} onPeriodicityChange={handlePeriodicityChange} />}
                {activeTab === 1 && <DescuentosTab data={form} onChange={handleGeneralChange} />}
                {activeTab === 2 && <ModulesTab data={form} onModuleChange={handleModuleChange} onGeneralChange={handleGeneralChange} />}
                {activeTab === 3 && <ProductsTab products={form.productDetails} onProductChange={handleProductChange} />}
                {activeTab === 4 && <SummaryTab data={form} onSave={handleSave} saving={saving} />}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 65, paddingBottom: 15, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#F3F4F6' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    tabsContainer: { backgroundColor: 'white', paddingVertical: 12 },
    tabButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#F9FAFB' },
    tabButtonActive: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2b5cb5' },
    tabText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
    tabTextActive: { color: '#2b5cb5' },
    content: { flex: 1, padding: 20 },
    tabContent: { paddingBottom: 40 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginTop: 20, marginBottom: 12 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 14, marginBottom: 12 },
    disabledInput: { backgroundColor: '#F9FAFB', color: '#9CA3AF' },
    label: { fontSize: 13, color: '#4B5563', marginBottom: 6, fontWeight: '500' },
    helperText: { fontSize: 12, color: '#EF4444' },
    helperTextGray: { fontSize: 12, color: '#6B7280', marginBottom: 15 },
    row: { flexDirection: 'row', marginBottom: 10 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    resultLabel: { color: '#6B7280', fontSize: 14 },
    resultValue: { fontWeight: '600', color: '#111827' },
    productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    productName: { fontSize: 14, fontWeight: '600' },
    productPrice: { fontSize: 12, color: '#6B7280' },
    inputCentered: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, textAlign: 'center', minWidth: 60 },
    summaryCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6' },
    summaryHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#2b5cb5' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
    bold: { fontWeight: 'bold', color: '#111827' },
    totalText: { fontSize: 18, fontWeight: '800' },
    
    grandTotalContainer: { 
        backgroundColor: 'white', 
        paddingVertical: 30, 
        paddingHorizontal: 20, 
        borderRadius: 20, 
        marginBottom: 25, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed'
    },
    grandTotalLabel: { 
        color: '#6B7280', 
        fontSize: 11, 
        fontWeight: '800', 
        letterSpacing: 2, 
        marginBottom: 6,
        textTransform: 'uppercase'
    },
    grandTotalValue: { 
        color: '#111827', 
        fontSize: 36, 
        fontWeight: '900',
        letterSpacing: -1
    },

    saveButton: { backgroundColor: '#ecfdf5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, borderWidth: 1, borderColor: '#15c899' },
    saveButtonText: { color: '#15c899', fontWeight: 'bold', fontSize: 16 },
    periodicityContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    periodicityBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
    periodicityBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#2b5cb5' },
    periodicityText: { fontSize: 12, color: '#6B7280' },
    periodicityTextActive: { color: '#2b5cb5', fontWeight: '700' }
});