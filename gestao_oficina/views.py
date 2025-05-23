# gestao_oficina/views.py

# Imports para DRF e os models
from .models import Cliente, Veiculo # Modelos
from .serializers import ClienteSerializer, VeiculoSerializer # Nossos serializers
from rest_framework import generics
# from rest_framework import permissions # Para permissões, se necessário depois

# --- VIEWS DE CLIENTE COM DRF (JÁ EXISTENTES E CORRETAS) ---
class ClienteListCreateAPIView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all().order_by('nome_completo')
    serializer_class = ClienteSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ClienteRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- VIEWS DE VEICULO REATORADAS COM DJANGO REST FRAMEWORK ---
class VeiculoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Veiculo.objects.select_related('cliente').all().order_by('marca', 'modelo')
    serializer_class = VeiculoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo de permissão

class VeiculoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Veiculo.objects.select_related('cliente').all()
    serializer_class = VeiculoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo de permissão