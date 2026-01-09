from django.urls import path
from . import views

app_name = 'lab'

urlpatterns = [
    # Lab Tests (Catalog)
    path('tests/', views.LabTestListView.as_view(), name='test-list'),
    path('tests/<int:id>/', views.LabTestDetailView.as_view(), name='test-detail'),
    
    # Lab Orders
    path('orders/', views.LabOrderListView.as_view(), name='order-list'),
    path('orders/<int:id>/', views.LabOrderDetailView.as_view(), name='order-detail'),
    
    # Lab Worklist
    path('worklist/', views.lab_worklist_view, name='worklist'),
    
    # Lab Order Actions
    path('orders/<int:order_id>/collect-sample/', views.collect_sample_view, name='collect-sample'),
    path('orders/<int:order_id>/start-processing/', views.start_processing_view, name='start-processing'),
    path('orders/<int:order_id>/cancel/', views.cancel_order_view, name='cancel-order'),
    
    # Lab Results
    path('results/', views.LabResultListView.as_view(), name='result-list'),
    path('results/<int:id>/', views.LabResultDetailView.as_view(), name='result-detail'),
    path('results/by-order/<int:order_id>/', views.result_by_order_view, name='result-by-order'),
    path('results/<int:result_id>/verify/', views.verify_result_view, name='verify-result'),
    
    # Lab Statistics
    path('statistics/', views.lab_statistics_view, name='statistics'),
]
