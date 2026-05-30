from django.urls import path
from .views import StockListView, StockDetailView, MouvementView, StockSummaryView

urlpatterns = [
    path('stocks/', StockListView.as_view(), name='stocks'),
    path('stocks/<int:pk>/', StockDetailView.as_view(), name='stock-detail'),
    path('stocks/mouvements/', MouvementView.as_view(), name='mouvements'),
    path('stocks/summary/', StockSummaryView.as_view(), name='stock-summary'),
]
