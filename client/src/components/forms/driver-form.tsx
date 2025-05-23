import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertDriverSchema, type Driver } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DriverFormProps {
  driver?: Driver | null;
  onSuccess: () => void;
}

export default function DriverForm({ driver, onSuccess }: DriverFormProps) {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(insertDriverSchema),
    defaultValues: {
      fullName: driver?.fullName || "",
      email: driver?.email || "",
      phone: driver?.phone || "",
      nik: driver?.nik || "",
      address: driver?.address || "",
      simNumber: driver?.simNumber || "",
      status: driver?.status || "active",
      rating: driver?.rating || "5.00",
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: any) => {
      if (driver) {
        await apiRequest("PUT", `/api/drivers/${driver.id}`, data);
      } else {
        await apiRequest("POST", "/api/drivers", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({
        title: "Berhasil",
        description: driver ? "Driver berhasil diupdate" : "Driver berhasil ditambahkan",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data driver",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createDriverMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama lengkap" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="08xxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK (KTP)</FormLabel>
                <FormControl>
                  <Input placeholder="16 digit NIK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Lengkap</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan alamat lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="simNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor SIM</FormLabel>
                <FormControl>
                  <Input placeholder="Nomor SIM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="suspended">Ditangguhkan</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="submit"
            disabled={createDriverMutation.isPending}
          >
            {createDriverMutation.isPending 
              ? "Menyimpan..." 
              : driver 
                ? "Update Driver" 
                : "Simpan Driver"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
