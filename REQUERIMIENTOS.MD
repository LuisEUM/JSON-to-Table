# Requerimiento: Sistema de Análisis y Visualización de Datos de Clientes

## Objetivo
Desarrollar un sistema integral de visualización y análisis de datos de clientes procedentes de la API de Holded, que permita monitorizar estados, categorizar segmentos y visualizar tendencias a través de múltiples formatos (tabular, gráfico y calendario).

## Contexto
Actualmente disponemos de datos estructurados de clientes que requieren un procesamiento secundario para obtener insights estratégicos sobre el estado de clientes, membresías y formaciones.

## Especificaciones Funcionales

### 1. Categorización de Estados de Clientes
Implementar un sistema que clasifique automáticamente a los clientes según:

**Estados operativos:**
- Cliente activo
- Cliente desactivado
- Cliente en período de pre-desactivación (alerta un mes antes)
- Cliente desactivado con servicios activos (accesos a formación mantenidos)

**Segmentación por antigüedad:**
- Cliente recién adquirido (<1 mes)
- Cliente en proceso de fidelización (1-3 meses)
- Cliente fidelizado (>3 meses)
- Cliente leyenda (>1 año)

### 2. Gestión de Membresías
Monitorizar el ciclo de vida de membresías con renovaciones periódicas (mensual/trimestral/semestral/anual):

- Membresía activa
- Membresía pendiente de activación
- Membresía próxima a desactivar (alerta un mes antes)
- Membresía desactivada

### 3. Seguimiento de Formaciones
Controlar el estado de las formaciones según su ciclo de vida:

- Formación pendiente de inicio
- Formación en curso
- Formación próxima a finalizar (alerta un mes antes)
- Formación finalizada
- Formación con período extendido (un año posterior a finalización)

### 4. Requisitos de Visualización (KPIs)

**Gráficas requeridas:**
1. **Evolución por Formación:** Visualización del crecimiento/decrecimiento por edición de cada formación
2. **Comparativa Anual:** Análisis comparativo de formaciones por año basado en máximos de inscripción
3. **Tendencias de Membresías:** Monitorización temporal (diaria/mensual/anual) de:
   - Activaciones históricas
   - Desactivaciones históricas
   - Proyecciones de activación/desactivación (mes actual y futuros)

### 5. Formatos de Visualización
Implementar múltiples vistas manteniendo coherencia en filtros aplicados:
- Vista tabular (existente)
- Vista JSON (nueva)
- Vista calendario (nueva)
- Vista gráfica (nueva)

## Cronograma
Fecha límite de implementación: Viernes de la próxima semana

## Consideraciones Técnicas
- Integración con API de Holded como fuente de datos primaria
- Procesamiento secundario de datos para extracción de insights
- Sistema de alertas pre-configuradas (1 mes antes de fechas clave)
- Consistencia de filtros entre diferentes vistas