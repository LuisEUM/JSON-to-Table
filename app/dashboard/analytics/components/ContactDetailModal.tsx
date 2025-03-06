import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicServicesSection } from "./DynamicServicesSection";

export interface MembershipInfo {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface TrainingInfo {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  extendedEndDate?: string;
}

export interface Contact {
  id: string;
  name: string;
  status?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  tenure?: string;
  memberships?: MembershipInfo[];
  trainings?: TrainingInfo[];
  notes?: string;
  customFields?: Record<string, unknown>;
  [key: string]: unknown; // Para cualquier propiedad adicional
}

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

// Component to display JSON data with enhanced styling
const JsonDisplay = ({ data, label }: { data: unknown; label?: string }) => {
  if (!data) return <span className='text-gray-500'>No data</span>;

  // For simple values, just return as string
  if (typeof data !== "object" || data === null) {
    return <span>{String(data)}</span>;
  }

  // Handle array or object
  try {
    // Parse the JSON value if it's passed as a string
    const jsonData = typeof data === "string" ? JSON.parse(data) : data;

    // Get a background color for the container based on the label
    const getBgColor = (): string => {
      if (!label) return "bg-gray-50";

      const labelLower = label.toLowerCase();
      if (labelLower.includes("client") || labelLower.includes("record")) {
        return "bg-blue-50";
      } else if (
        labelLower.includes("address") ||
        labelLower.includes("location")
      ) {
        return "bg-teal-50";
      } else if (
        labelLower.includes("payment") ||
        labelLower.includes("defaults")
      ) {
        return "bg-purple-50";
      } else if (
        labelLower.includes("social") ||
        labelLower.includes("network")
      ) {
        return "bg-pink-50";
      } else if (labelLower.includes("tag")) {
        return "bg-amber-50";
      }
      return "bg-gray-50";
    };

    return (
      <div
        className={`rounded-md border border-gray-200 ${getBgColor()} overflow-hidden`}
      >
        {Object.entries(jsonData).map(([key, value], index) => {
          // Don't render empty arrays or objects
          if (
            typeof value === "object" &&
            value !== null &&
            (Array.isArray(value)
              ? value.length === 0
              : Object.keys(value).length === 0)
          ) {
            return null;
          }

          return (
            <div
              key={key}
              className={`flex ${
                index !== Object.entries(jsonData).length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              <div className='w-1/3 p-2 text-sm font-medium text-gray-700 bg-opacity-50 bg-gray-100'>
                {key}
              </div>
              <div className='w-2/3 p-2 text-sm'>
                {typeof value === "object" && value !== null ? (
                  <div className='pl-2 border-l-2 border-gray-200'>
                    <JsonDisplay data={value} />
                  </div>
                ) : (
                  String(value)
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    // Return the original data as string if there's an error
    console.error("Error rendering JSON:", error);
    return (
      <pre className='text-xs font-mono p-2 bg-gray-50 rounded-md overflow-auto max-h-[150px] whitespace-pre-wrap border border-gray-200'>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }
};

// Component to display custom fields organized by category
const CustomFieldsSection = ({
  customFields,
}: {
  customFields?: Record<string, unknown>;
}) => {
  if (!customFields || Object.keys(customFields).length === 0) {
    return (
      <div className='text-sm text-gray-500 text-center p-4'>
        No hay campos personalizados
      </div>
    );
  }

  // Organize fields by category
  const categorizedFields: Record<string, Record<string, unknown>> = {};

  Object.entries(customFields).forEach(([key, value]) => {
    // Only include fields with value
    if (value === "" || value === null || value === undefined) return;

    // Try to extract a prefix from the field name (e.g., "CLIENTE VENTAS - ")
    const match = key.match(/^([A-Z\s]+)\s-\s/);
    const category = match ? match[1] : "Otros";

    if (!categorizedFields[category]) {
      categorizedFields[category] = {};
    }

    // Save the field in its corresponding category
    const fieldName = match ? key.replace(match[0], "") : key;
    categorizedFields[category][fieldName] = value;
  });

  // Remove empty categories
  Object.keys(categorizedFields).forEach((category) => {
    if (Object.keys(categorizedFields[category]).length === 0) {
      delete categorizedFields[category];
    }
  });

  // Function to get a background color based on the category
  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      CLIENTE: "bg-blue-50",
      DOCUMENTACIÓN: "bg-amber-50",
      FORMACIÓN: "bg-emerald-50",
      FACTURACIÓN: "bg-purple-50",
      CONTACTO: "bg-teal-50",
    };

    // Find exact or partial match
    for (const [key, color] of Object.entries(categoryColors)) {
      if (category.includes(key)) {
        return color;
      }
    }
    return "bg-gray-50"; // Default color
  };

  return (
    <div className='mt-6'>
      <h3 className='text-sm font-medium mb-4'>Campos personalizados:</h3>
      <div className='space-y-4'>
        {Object.entries(categorizedFields).map(([category, fields]) => (
          <div
            key={category}
            className={`p-4 rounded-md border ${getCategoryColor(
              category
            )} transition-all`}
          >
            <div className='flex justify-between items-center mb-3'>
              <h4 className='font-semibold text-sm'>{category}</h4>
              <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-200'>
                {Object.keys(fields).length}
              </Badge>
            </div>

            <div className='space-y-2'>
              {Object.entries(fields).map(([fieldName, fieldValue], index) => (
                <div
                  key={index}
                  className='grid grid-cols-3 gap-2 py-1 border-b border-gray-100 last:border-0'
                >
                  <span className='text-sm font-medium text-gray-700'>
                    {fieldName}:
                  </span>
                  <div className='col-span-2 max-h-[150px] overflow-auto'>
                    {typeof fieldValue === "object" && fieldValue !== null ? (
                      <pre className='text-xs font-mono bg-gray-50 p-2 rounded-sm whitespace-pre-wrap'>
                        {JSON.stringify(fieldValue, null, 2)}
                      </pre>
                    ) : (
                      <span className='text-sm'>{String(fieldValue)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ContactDetailModal({
  isOpen,
  onClose,
  contact,
}: ContactDetailModalProps) {
  const [fullContact, setFullContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Partial<Contact>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contact && isOpen) {
      fetchContactDetails(contact.id);
    }
  }, [contact, isOpen]);

  useEffect(() => {
    if (fullContact) {
      setEditedContact({
        id: fullContact.id,
        name: fullContact.name,
        email: fullContact.email || "",
        phone: fullContact.phone || "",
        address: fullContact.address || "",
        notes: fullContact.notes || "",
        customFields: fullContact.customFields || {},
      });
    }
  }, [fullContact]);

  const fetchContactDetails = async (id: string): Promise<Contact> => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/holded/contacts/${id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener contacto: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos completos del contacto:", data); // For debugging

      // Transform customFields from array to object if necessary
      let processedCustomFields = data.customFields;
      if (Array.isArray(data.customFields)) {
        processedCustomFields = data.customFields.reduce(
          (obj: Record<string, unknown>, item: Record<string, unknown>) => {
            if (item.field && typeof item.field === "string") {
              obj[item.field] = item.value;
            }
            return obj;
          },
          {}
        );
      }

      // Format dates if they are in timestamp
      const formatTimestamp = (timestamp: number | string | undefined) => {
        if (!timestamp) return "";

        const date =
          typeof timestamp === "number"
            ? new Date(timestamp * 1000)
            : new Date(timestamp);

        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      // Ensure all fields are present
      const processedContact: Contact = {
        ...data,
        id: data.id || data._id || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        customFields: processedCustomFields || {},
        memberships: data.memberships || [],
        trainings: data.trainings || [],
        // Format dates if they exist
        createdAt: formatTimestamp(data.createdAt),
        updatedAt: formatTimestamp(data.updatedAt),
      };

      setFullContact(processedContact);
      return processedContact;
    } catch (error) {
      console.error("Error al cargar detalles del contacto:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedContact((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!fullContact) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/holded/contacts/${fullContact.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedContact.name,
          email: editedContact.email,
          phone: editedContact.phone,
          address: editedContact.address,
          notes: editedContact.notes,
          customFields: editedContact.customFields,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el contacto: ${response.status}`);
      }

      const updatedContact = await response.json();
      setFullContact(updatedContact);
      setIsEditing(false);
      toast.success("Contacto actualizado", {
        description: "Los datos del contacto se han actualizado correctamente.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error updating contact:", err);
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format date if it exists
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Translate tenure status
  const translateTenure = (tenure?: string) => {
    if (!tenure) return "N/A";
    const tenureMap: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
    };
    return tenureMap[tenure.toLowerCase()] || tenure;
  };

  // Determine badge color based on status
  const getStatusBadgeVariant = (
    status?: string
  ): "outline" | "secondary" | "destructive" | "default" => {
    if (!status) return "outline";

    switch (status.toLowerCase()) {
      case "active":
      case "activo":
        return "default";
      case "inactive":
      case "inactivo":
        return "secondary";
      case "suspended":
      case "suspendido":
        return "destructive";
      default:
        return "outline";
    }
  };

  const displayedContact = fullContact || contact;

  if (!displayedContact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <div className='flex justify-between items-start'>
            <DialogTitle className='text-xl font-bold'>
              {isEditing ? (
                <Input
                  name='name'
                  value={editedContact.name || ""}
                  onChange={handleInputChange}
                  className='mt-1'
                />
              ) : (
                displayedContact.name
              )}
            </DialogTitle>
            <Button
              variant='outline'
              size='icon'
              onClick={handleEditToggle}
              disabled={loading || isSaving}
            >
              {isEditing ? (
                <X className='h-4 w-4' />
              ) : (
                <Pencil className='h-4 w-4' />
              )}
            </Button>
          </div>
          {displayedContact.status && (
            <Badge
              className='mt-2 self-start'
              variant={getStatusBadgeVariant(displayedContact.status)}
            >
              {displayedContact.status}
            </Badge>
          )}
          <DialogDescription className='mt-2'>
            ID: {displayedContact.id}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='py-4 text-center'>
            Cargando detalles del contacto...
          </div>
        ) : error ? (
          <div className='py-4 text-center text-red-500'>{error}</div>
        ) : (
          <div className='flex-grow overflow-hidden'>
            <Tabs defaultValue='info' className='w-full h-full flex flex-col'>
              <TabsList className='grid w-full grid-cols-2 flex-shrink-0'>
                <TabsTrigger value='info'>Información</TabsTrigger>
                <TabsTrigger value='services'>Servicios</TabsTrigger>
              </TabsList>

              <div className='flex-grow overflow-hidden'>
                <TabsContent value='info' className='h-full'>
                  <ScrollArea className='h-[calc(70vh-10rem)]'>
                    <div className='space-y-4 py-4 pr-4'>
                      {/* Primary Information */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {displayedContact.email && (
                          <div className='space-y-1'>
                            <h3 className='text-sm font-semibold'>Email</h3>
                            {isEditing ? (
                              <Input
                                name='email'
                                value={editedContact.email || ""}
                                onChange={handleInputChange}
                              />
                            ) : (
                              <p className='text-sm'>
                                {displayedContact.email}
                              </p>
                            )}
                          </div>
                        )}

                        {displayedContact.phone && (
                          <div className='space-y-1'>
                            <h3 className='text-sm font-semibold'>Teléfono</h3>
                            {isEditing ? (
                              <Input
                                name='phone'
                                value={editedContact.phone || ""}
                                onChange={handleInputChange}
                              />
                            ) : (
                              <p className='text-sm'>
                                {displayedContact.phone}
                              </p>
                            )}
                          </div>
                        )}

                        {displayedContact.address && (
                          <div className='space-y-1'>
                            <h3 className='text-sm font-semibold'>Dirección</h3>
                            {isEditing ? (
                              <Input
                                name='address'
                                value={editedContact.address || ""}
                                onChange={handleInputChange}
                              />
                            ) : (
                              <p className='text-sm'>
                                {displayedContact.address}
                              </p>
                            )}
                          </div>
                        )}

                        {displayedContact.type && (
                          <div className='space-y-1'>
                            <h3 className='text-sm font-semibold'>Tipo</h3>
                            <p className='text-sm'>{displayedContact.type}</p>
                          </div>
                        )}

                        {displayedContact.tenure && (
                          <div className='space-y-1'>
                            <h3 className='text-sm font-semibold'>
                              Antigüedad
                            </h3>
                            <Badge
                              variant={getStatusBadgeVariant(
                                displayedContact.tenure
                              )}
                            >
                              {translateTenure(displayedContact.tenure)}
                            </Badge>
                          </div>
                        )}

                        {displayedContact.createdAt && (
                          <div className='space-y-1'>
                            <h3 className='text-sm font-semibold'>
                              Fecha de creación
                            </h3>
                            <p className='text-sm'>
                              {formatDate(displayedContact.createdAt)}
                            </p>
                          </div>
                        )}

                        {displayedContact.updatedAt && (
                          <div className='space-y-1'>
                            <h3 className='text-sm font-semibold'>
                              Última actualización
                            </h3>
                            <p className='text-sm'>
                              {formatDate(displayedContact.updatedAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Notes Section */}
                      {(displayedContact.notes || isEditing) && (
                        <div className='space-y-1 mt-6'>
                          <h3 className='text-sm font-semibold'>Notas</h3>
                          {isEditing ? (
                            <Textarea
                              name='notes'
                              value={editedContact.notes || ""}
                              onChange={handleInputChange}
                              className='min-h-[100px]'
                            />
                          ) : (
                            <div className='max-h-[200px] overflow-auto border rounded-md p-3 bg-gray-50'>
                              <pre className='whitespace-pre-wrap text-sm'>
                                {displayedContact.notes || "N/A"}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Custom fields */}
                      <CustomFieldsSection
                        customFields={displayedContact.customFields}
                      />

                      {/* Additional properties with structured visualization */}
                      {Object.entries(displayedContact)
                        .filter(
                          ([key]) =>
                            ![
                              "id",
                              "name",
                              "email",
                              "phone",
                              "address",
                              "customFields",
                              "notes",
                              "type",
                              "memberships",
                              "trainings",
                              "_id",
                              "createdAt",
                              "updatedAt",
                              "tenure",
                              "status",
                            ].includes(key) &&
                            displayedContact[key] !== null &&
                            displayedContact[key] !== undefined &&
                            displayedContact[key] !== ""
                        )
                        .map(([key, value]) => (
                          <div key={key} className='space-y-2 mb-4'>
                            <h3 className='text-sm font-semibold capitalize'>
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </h3>
                            <JsonDisplay data={value} label={key} />
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value='services' className='h-full'>
                  <div className='h-full'>
                    {displayedContact ? (
                      <DynamicServicesSection contact={displayedContact} />
                    ) : (
                      <div className='text-center py-4 text-muted-foreground'>
                        No hay información de servicios disponible
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        <DialogFooter className='flex justify-between mt-4 flex-shrink-0'>
          {isEditing ? (
            <>
              <Button
                variant='outline'
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Cerrar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
