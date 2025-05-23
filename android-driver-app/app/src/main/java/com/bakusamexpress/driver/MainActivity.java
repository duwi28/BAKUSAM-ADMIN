package com.bakusamexpress.driver;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.LinearLayout;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Timer;
import java.util.TimerTask;
import java.text.SimpleDateFormat;
import java.util.Date;

public class MainActivity extends AppCompatActivity {
    
    private Switch onlineSwitch;
    private TextView statusText;
    private TextView earningsAmount;
    private TextView balanceText;
    private TextView currentTimeText;
    private LinearLayout ordersContainer;
    private Button withdrawButton;
    
    private boolean isOnline = true;
    private int currentEarnings = 150000;
    private int currentBalance = 850000;
    private Timer timeTimer;
    
    private SharedPreferences prefs;
    private NumberFormat currencyFormat;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        initializeViews();
        setupCurrencyFormat();
        setupTimer();
        loadUserData();
        setupClickListeners();
        updateUI();
        loadOrders();
    }
    
    private void initializeViews() {
        onlineSwitch = findViewById(R.id.onlineSwitch);
        statusText = findViewById(R.id.statusText);
        earningsAmount = findViewById(R.id.earningsAmount);
        balanceText = findViewById(R.id.balanceText);
        currentTimeText = findViewById(R.id.currentTimeText);
        ordersContainer = findViewById(R.id.ordersContainer);
        withdrawButton = findViewById(R.id.withdrawButton);
        
        prefs = getSharedPreferences("DriverApp", MODE_PRIVATE);
    }
    
    private void setupCurrencyFormat() {
        currencyFormat = NumberFormat.getCurrencyInstance(new Locale("id", "ID"));
    }
    
    private void setupTimer() {
        timeTimer = new Timer();
        timeTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                runOnUiThread(() -> updateTime());
            }
        }, 0, 1000);
    }
    
    private void updateTime() {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", new Locale("id", "ID"));
        currentTimeText.setText(sdf.format(new Date()));
    }
    
    private void loadUserData() {
        isOnline = prefs.getBoolean("isOnline", true);
        currentEarnings = prefs.getInt("earnings", 150000);
        currentBalance = prefs.getInt("balance", 850000);
    }
    
    private void saveUserData() {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("isOnline", isOnline);
        editor.putInt("earnings", currentEarnings);
        editor.putInt("balance", currentBalance);
        editor.apply();
    }
    
    private void setupClickListeners() {
        onlineSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            isOnline = isChecked;
            updateUI();
            saveUserData();
            
            String message = isOnline ? 
                "Status Online - Siap menerima order baru" : 
                "Status Offline - Tidak akan menerima order baru";
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        });
        
        withdrawButton.setOnClickListener(v -> {
            if (currentBalance < 50000) {
                Toast.makeText(this, "Saldo tidak mencukupi! Minimal penarikan Rp 50.000", 
                    Toast.LENGTH_LONG).show();
                return;
            }
            
            // Open withdrawal activity
            Intent intent = new Intent(this, EarningsActivity.class);
            intent.putExtra("action", "withdraw");
            intent.putExtra("currentBalance", currentBalance);
            startActivityForResult(intent, 100);
        });
    }
    
    private void updateUI() {
        onlineSwitch.setChecked(isOnline);
        statusText.setText(isOnline ? "ONLINE" : "OFFLINE");
        statusText.setTextColor(getResources().getColor(
            isOnline ? R.color.green_500 : R.color.red_500));
        
        earningsAmount.setText(formatCurrency(currentEarnings));
        balanceText.setText("Saldo: " + formatCurrency(currentBalance));
        
        // Show/hide orders based on online status
        if (isOnline) {
            ordersContainer.setVisibility(View.VISIBLE);
            findViewById(R.id.offlineMessage).setVisibility(View.GONE);
        } else {
            ordersContainer.setVisibility(View.GONE);
            findViewById(R.id.offlineMessage).setVisibility(View.VISIBLE);
        }
    }
    
    private void loadOrders() {
        ordersContainer.removeAllViews();
        
        // Order 1 - With Talangan
        addOrderCard(1, "Andi Wijaya", "08223456789", 
            "Mall Central Park", "Apartemen Taman Anggrek", 
            "2.5 km", 25000, 50000, "Bayar tagihan listrik di loket mall", 15);
        
        // Order 2 - Regular
        addOrderCard(2, "Sari Indah", "08334567890",
            "Restoran Padang Sederhana", "Kantor BCA Tower",
            "3.1 km", 32000, 0, null, 18);
        
        // Order 3 - With Talangan  
        addOrderCard(3, "Budi Hartono", "08445678901",
            "Apotek Kimia Farma", "Perumahan Green Garden",
            "4.2 km", 38000, 75000, "Beli obat diabetes sesuai resep", 22);
    }
    
    private void addOrderCard(int orderId, String customerName, String customerPhone,
                             String pickup, String delivery, String distance, 
                             int fare, int talanganAmount, String talanganNote, int duration) {
        
        View orderCard = getLayoutInflater().inflate(R.layout.order_card, ordersContainer, false);
        
        TextView orderNumber = orderCard.findViewById(R.id.orderNumber);
        TextView orderDistance = orderCard.findViewById(R.id.orderDistance);
        TextView customerNameView = orderCard.findViewById(R.id.customerName);
        TextView addressInfo = orderCard.findViewById(R.id.addressInfo);
        TextView orderFare = orderCard.findViewById(R.id.orderFare);
        TextView orderTime = orderCard.findViewById(R.id.orderTime);
        Button acceptButton = orderCard.findViewById(R.id.acceptButton);
        View talanganSection = orderCard.findViewById(R.id.talanganSection);
        TextView talanganAmount_tv = orderCard.findViewById(R.id.talanganAmount);
        TextView talanganNote_tv = orderCard.findViewById(R.id.talanganNote);
        TextView talanganSummary = orderCard.findViewById(R.id.talanganSummary);
        
        orderNumber.setText("Order #" + orderId);
        orderDistance.setText(distance);
        customerNameView.setText(customerName);
        addressInfo.setText("📍 " + pickup + " → " + delivery);
        orderFare.setText("Ongkir: " + formatCurrency(fare));
        orderTime.setText(duration + " menit");
        
        boolean hasTalangan = talanganAmount > 0;
        
        if (hasTalangan) {
            talanganSection.setVisibility(View.VISIBLE);
            talanganAmount_tv.setText(formatCurrency(talanganAmount));
            talanganNote_tv.setText(talanganNote);
            talanganSummary.setText("+ Talangan: " + formatCurrency(talanganAmount));
            talanganSummary.setVisibility(View.VISIBLE);
            
            acceptButton.setText("💰 Terima + Talangan");
            acceptButton.setBackgroundColor(getResources().getColor(R.color.orange_500));
        } else {
            talanganSection.setVisibility(View.GONE);
            talanganSummary.setVisibility(View.GONE);
            acceptButton.setText("Terima");
            acceptButton.setBackgroundColor(getResources().getColor(R.color.green_500));
        }
        
        acceptButton.setOnClickListener(v -> {
            if (hasTalangan) {
                showTalanganConfirmation(orderId, customerName, customerPhone, 
                    fare, talanganAmount, talanganNote);
            } else {
                acceptRegularOrder(orderId, customerName, fare);
            }
        });
        
        ordersContainer.addView(orderCard);
    }
    
    private void acceptRegularOrder(int orderId, String customerName, int fare) {
        Toast.makeText(this, "Order #" + orderId + " berhasil diterima!\nMenuju lokasi pickup...", 
            Toast.LENGTH_LONG).show();
        
        // Update earnings
        currentEarnings += fare;
        currentBalance += Math.round(fare * 0.7f);
        updateUI();
        saveUserData();
    }
    
    private void showTalanganConfirmation(int orderId, String customerName, String customerPhone,
                                        int fare, int talanganAmount, String talanganNote) {
        Intent intent = new Intent(this, TalanganConfirmActivity.class);
        intent.putExtra("orderId", orderId);
        intent.putExtra("customerName", customerName);
        intent.putExtra("customerPhone", customerPhone);
        intent.putExtra("fare", fare);
        intent.putExtra("talanganAmount", talanganAmount);
        intent.putExtra("talanganNote", talanganNote);
        intent.putExtra("currentBalance", currentBalance);
        startActivityForResult(intent, 200);
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == 200 && resultCode == RESULT_OK) {
            // Talangan order accepted
            int orderId = data.getIntExtra("orderId", 0);
            int fare = data.getIntExtra("fare", 0);
            int talanganAmount = data.getIntExtra("talanganAmount", 0);
            
            currentEarnings += fare;
            currentBalance += Math.round(fare * 0.7f) - talanganAmount;
            updateUI();
            saveUserData();
            
            Toast.makeText(this, "Order #" + orderId + " dengan talangan berhasil diterima!", 
                Toast.LENGTH_LONG).show();
        }
        
        if (requestCode == 100 && resultCode == RESULT_OK) {
            // Withdrawal completed
            int withdrawAmount = data.getIntExtra("withdrawAmount", 0);
            currentBalance -= withdrawAmount;
            updateUI();
            saveUserData();
            
            Toast.makeText(this, "Penarikan Rp " + formatCurrency(withdrawAmount) + " berhasil!", 
                Toast.LENGTH_LONG).show();
        }
    }
    
    private String formatCurrency(int amount) {
        return "Rp " + String.format(Locale.GERMANY, "%,d", amount);
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (timeTimer != null) {
            timeTimer.cancel();
        }
    }
}