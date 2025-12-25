import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Car, Plus, Pencil, Trash2 } from "lucide-react";

interface CarBrand {
  id: string;
  name: string;
  logo_code: string;
}

interface CarModel {
  id: string;
  name: string;
  brand_id: string;
  year_start: number | null;
  year_end: number | null;
  image_url: string | null;
}

const AdminCarModels = () => {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);
  const [modelFormData, setModelFormData] = useState({
    name: "",
    brand_id: "",
    year_start: "",
    year_end: "",
    image_url: "",
  });
  const [brandFormData, setBrandFormData] = useState({
    name: "",
    logo_code: "",
  });
  const queryClient = useQueryClient();

  const { data: brands } = useQuery({
    queryKey: ["car-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_brands")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CarBrand[];
    },
  });

  const { data: models, isLoading } = useQuery({
    queryKey: ["car-models-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_models")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CarModel[];
    },
  });

  const createBrandMutation = useMutation({
    mutationFn: async (data: { name: string; logo_code: string }) => {
      const { error } = await supabase.from("car_brands").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-brands"] });
      toast.success("Brand created");
      setBrandFormData({ name: "", logo_code: "" });
      setIsBrandDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create brand");
      console.error(error);
    },
  });

  const createModelMutation = useMutation({
    mutationFn: async (data: Omit<CarModel, "id">) => {
      const { error } = await supabase.from("car_models").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-models-admin"] });
      toast.success("Model created");
      resetModelForm();
    },
    onError: (error) => {
      toast.error("Failed to create model");
      console.error(error);
    },
  });

  const updateModelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CarModel> }) => {
      const { error } = await supabase.from("car_models").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-models-admin"] });
      toast.success("Model updated");
      resetModelForm();
    },
    onError: (error) => {
      toast.error("Failed to update model");
      console.error(error);
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("car_models").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-models-admin"] });
      toast.success("Model deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete model");
      console.error(error);
    },
  });

  const resetModelForm = () => {
    setModelFormData({
      name: "",
      brand_id: "",
      year_start: "",
      year_end: "",
      image_url: "",
    });
    setEditingModel(null);
    setIsModelDialogOpen(false);
  };

  const handleEditModel = (model: CarModel) => {
    setEditingModel(model);
    setModelFormData({
      name: model.name,
      brand_id: model.brand_id,
      year_start: model.year_start?.toString() || "",
      year_end: model.year_end?.toString() || "",
      image_url: model.image_url || "",
    });
    setIsModelDialogOpen(true);
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: modelFormData.name,
      brand_id: modelFormData.brand_id,
      year_start: modelFormData.year_start ? parseInt(modelFormData.year_start) : null,
      year_end: modelFormData.year_end ? parseInt(modelFormData.year_end) : null,
      image_url: modelFormData.image_url || null,
    };

    if (editingModel) {
      updateModelMutation.mutate({ id: editingModel.id, data });
    } else {
      createModelMutation.mutate(data);
    }
  };

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBrandMutation.mutate(brandFormData);
  };

  const getBrandName = (brandId: string) => {
    return brands?.find((b) => b.id === brandId)?.name || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brands Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Car Brands
            </CardTitle>
            <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Brand</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBrandSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input
                      id="brand-name"
                      value={brandFormData.name}
                      onChange={(e) =>
                        setBrandFormData({ ...brandFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo-code">Logo Code</Label>
                    <Input
                      id="logo-code"
                      value={brandFormData.logo_code}
                      onChange={(e) =>
                        setBrandFormData({ ...brandFormData, logo_code: e.target.value })
                      }
                      placeholder="e.g., BMW, AUDI"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBrandDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {brands?.map((brand) => (
              <div
                key={brand.id}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              >
                {brand.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Models Section */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Car Models
            </CardTitle>
            <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetModelForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingModel ? "Edit Car Model" : "Add New Car Model"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleModelSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="model-name">Model Name</Label>
                    <Input
                      id="model-name"
                      value={modelFormData.name}
                      onChange={(e) =>
                        setModelFormData({ ...modelFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={modelFormData.brand_id}
                      onValueChange={(value) =>
                        setModelFormData({ ...modelFormData, brand_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year-start">Year Start</Label>
                      <Input
                        id="year-start"
                        type="number"
                        value={modelFormData.year_start}
                        onChange={(e) =>
                          setModelFormData({ ...modelFormData, year_start: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="year-end">Year End</Label>
                      <Input
                        id="year-end"
                        type="number"
                        value={modelFormData.year_end}
                        onChange={(e) =>
                          setModelFormData({ ...modelFormData, year_end: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={modelFormData.image_url}
                      onChange={(e) =>
                        setModelFormData({ ...modelFormData, image_url: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetModelForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingModel ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Years</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models?.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {model.image_url && (
                          <img
                            src={model.image_url}
                            alt={model.name}
                            className="w-12 h-8 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{model.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getBrandName(model.brand_id)}</TableCell>
                    <TableCell>
                      {model.year_start || "?"} - {model.year_end || "Present"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditModel(model)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Car Model</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{model.name}"? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteModelMutation.mutate(model.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCarModels;