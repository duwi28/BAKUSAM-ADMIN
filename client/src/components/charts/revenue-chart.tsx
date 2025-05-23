import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  data?: number[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: data || [2100000, 2300000, 1900000, 2800000, 3200000, 2900000, 2600000],
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "hsl(var(--primary))",
        pointBorderColor: "hsl(var(--primary))",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return "Rp " + new Intl.NumberFormat("id-ID").format(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return "Rp " + (value / 1000000).toFixed(1) + "M";
          },
        },
        grid: {
          color: "hsl(var(--border))",
        },
      },
      x: {
        grid: {
          color: "hsl(var(--border))",
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
