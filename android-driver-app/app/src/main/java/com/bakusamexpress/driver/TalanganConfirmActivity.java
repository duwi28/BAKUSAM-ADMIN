package com.bakusamexpress.driver;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Locale;

public class TalanganConfirmActivity extends AppCompatActivity {
    
    private TextView orderDetailsText;
    private TextView talanganAmountText;
    private TextView talanganNoteText;
    private TextView modalFareText;
    private TextView modalCommissionText;
    private TextView modalTalanganText;
    private TextView modalNetText;
    private Button rejectButton;
    private Button acceptButton;
    
    private int orderId;
    private String customerName;
    private String customerPhone;
    private int fare;
    private int talanganAmount;
    private String talanganNote;
    private int currentBalance;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_talangan_confirm);
        
        initializeViews();
        loadIntentData();
        setupClickListeners();
        updateUI();
    }
    
    private void initializeViews() {
        orderDetailsText = findViewById(R.id.orderDetailsText);
        talanganAmountText = findViewById(R.id.talanganAmountText);
        talanganNoteText = findViewById(R.id.talanganNoteText);
        modalFareText = findViewById(R.id.modalFareText);
        modalCommissionText = findViewById(R.id.modalCommissionText);
        modalTalanganText = findViewById(R.id.modalTalanganText);
        modalNetText = findViewById(R.id.modalNetText);
        rejectButton = findViewById(R.id.rejectButton);
        acceptButton = findViewById(R.id.acceptButton);
    }
    
    private void loadIntentData() {
        Intent intent = getIntent();
        orderId = intent.getIntExtra("orderId", 0);
        customerName = intent.getStringExtra("customerName");
        customerPhone = intent.getStringExtra("customerPhone");
        fare = intent.getIntExtra("fare", 0);
        talanganAmount = intent.getIntExtra("talanganAmount", 0);
        talanganNote = intent.getStringExtra("talanganNote");
        currentBalance = intent.getIntExtra("currentBalance", 0);
    }
    
    private void setupClickListeners() {
        rejectButton.setOnClickListener(v -> {
            setResult(RESULT_CANCELED);
            finish();
        });
        
        acceptButton.setOnClickListener(v -> {
            Intent resultIntent = new Intent();
            resultIntent.putExtra("orderId", orderId);
            resultIntent.putExtra("fare", fare);
            resultIntent.putExtra("talanganAmount", talanganAmount);
            setResult(RESULT_OK, resultIntent);
            finish();
        });
    }
    
    private void updateUI() {
        orderDetailsText.setText("Order #" + orderId + " - " + customerName + "\n📞 " + customerPhone);
        talanganAmountText.setText(formatCurrency(talanganAmount));
        talanganNoteText.setText("Keperluan: " + talanganNote);
        
        int commission = Math.round(fare * 0.7f);
        int netIncome = commission - talanganAmount;
        
        modalFareText.setText(formatCurrency(fare));
        modalCommissionText.setText(formatCurrency(commission));
        modalTalanganText.setText(formatCurrency(talanganAmount));
        modalNetText.setText(formatCurrency(netIncome));
        
        // Check if balance is sufficient
        if (currentBalance < talanganAmount) {
            acceptButton.setEnabled(false);
            acceptButton.setText("❌ Saldo Tidak Cukup");
            acceptButton.setBackgroundColor(getResources().getColor(R.color.red_500));
        }
    }
    
    private String formatCurrency(int amount) {
        return "Rp " + String.format(Locale.GERMANY, "%,d", amount);
    }
}