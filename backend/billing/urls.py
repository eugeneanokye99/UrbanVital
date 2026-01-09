# billing/urls.py
from django.urls import path
from .views import (
    ServiceItemListView,
    InvoiceListView,
    InvoiceDetailView,
    PendingInvoicesView,
    AddInvoiceItemView,
    ProcessPaymentView,
    BillingStatsView,
    financial_transactions_view,
)

urlpatterns = [
    # Service items
    path("services/", ServiceItemListView.as_view(), name="service-items"),
    
    # Invoices
    path("invoices/", InvoiceListView.as_view(), name="invoices-list"),
    path("invoices/pending/", PendingInvoicesView.as_view(), name="pending-invoices"),
    path("invoices/<int:id>/", InvoiceDetailView.as_view(), name="invoice-detail"),
    path("invoices/<int:invoice_id>/items/", AddInvoiceItemView.as_view(), name="add-invoice-item"),
    path("invoices/<int:invoice_id>/pay/", ProcessPaymentView.as_view(), name="process-payment"),
    
    # Stats and Reports
    path("stats/", BillingStatsView.as_view(), name="billing-stats"),
    path("transactions/", financial_transactions_view, name="financial-transactions"),
]