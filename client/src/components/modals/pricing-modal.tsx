import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPricingRuleSchema, insertPromotionSchema } from "@shared/schema";

const pricingFormSchema = insertPricingRuleSchema.extend({
  vehicleType: z.string().min(1, "Tipe kendaraan harus dipilih"),
  baseFare: z.string().min(1, "Tarif dasar harus diisi"),
  perKmRate: z.string().min(1, "Tarif per km harus diisi"),
});

const promotionFormSchema = insertPromotionSchema.extend({
  title: z.string().min(1, "Judul promo harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  discountType: z.string().min(1, "Tipe diskon harus dipilih"),
  discountValue: z.string().min(1, "Nilai diskon harus diisi"),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  endDate: z.string().min(1, "Tanggal berakhir harus diisi"),
});

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "pricing" | "promotion";
}

export default function PricingModal({ isOpen, onClose, type }: PricingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pricingForm = useForm<z.infer<typeof pricingFormSchema>>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      vehicleType: "",
      baseFare: "",
      perKmRate: "",
      isActive: true,
    },
  });

  const promotionForm = useForm<z.infer<typeof promotionFormSchema>>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      discountType: "",
      discountValue: "",
      minOrderValue: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      isActive: true,
      usageLimit: undefined,
    },
  });

  const createPricingMutation = useMutation({
    mutationFn: (data: z.infer<typeof pricingFormSchema>) =>
      apiRequest("POST", "/api/pricing-rules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-rules"] });
      toast({
        title: "Berhasil",
        description: "Tarif berhasil ditambahkan",
      });
      pricingForm.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan tarif",
        variant: "destructive",
      });
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: (data: z.infer<typeof promotionFormSchema>) =>
      apiRequest("POST", "/api/promotions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      toast({
        title: "Berhasil",
        description: "Promosi berhasil ditambahkan",
      });
      promotionForm.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan promosi",
        variant: "destructive",
      });
    },
  });

  const onPricingSubmit = (data: z.infer<typeof pricingFormSchema>) => {
    createPricingMutation.mutate(data);
  };

  const onPromotionSubmit = (data: z.infer<typeof promotionFormSchema>) => {
    createPromotionMutation.mutate(data);
  };

  if (type === "pricing") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Tarif Baru</DialogTitle>
          </DialogHeader>

          <Form {...pricingForm}>
            <form onSubmit={pricingForm.handleSubmit(onPricingSubmit)} className="space-y-6">
              <FormField
                control={pricingForm.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Kendaraan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe kendaraan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="motor">Motor</SelectItem>
                        <SelectItem value="mobil">Mobil</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={pricingForm.control}
                  name="baseFare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarif Dasar (Rp)</FormLabel>
                      <FormControl>
                        <Input placeholder="15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={pricingForm.control}
                  name="perKmRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarif per KM (Rp)</FormLabel>
                      <FormControl>
                        <Input placeholder="2000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPricingMutation.isPending}
                >
                  {createPricingMutation.isPending ? "Menyimpan..." : "Simpan Tarif"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Promosi Baru</DialogTitle>
        </DialogHeader>

        <Form {...promotionForm}>
          <form onSubmit={promotionForm.handleSubmit(onPromotionSubmit)} className="space-y-6">
            <FormField
              control={promotionForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Promosi</FormLabel>
                  <FormControl>
                    <Input placeholder="Diskon Akhir Tahun" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={promotionForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dapatkan diskon spesial untuk semua order"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={promotionForm.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Diskon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe diskon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Persentase (%)</SelectItem>
                        <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={promotionForm.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai Diskon</FormLabel>
                    <FormControl>
                      <Input placeholder="20 atau 10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={promotionForm.control}
                name="minOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal Order (Rp)</FormLabel>
                    <FormControl>
                      <Input placeholder="50000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={promotionForm.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maksimal Diskon (Rp)</FormLabel>
                    <FormControl>
                      <Input placeholder="25000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={promotionForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={promotionForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Berakhir</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={promotionForm.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batas Penggunaan (kosongkan untuk unlimited)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={createPromotionMutation.isPending}
              >
                {createPromotionMutation.isPending ? "Menyimpan..." : "Simpan Promosi"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
