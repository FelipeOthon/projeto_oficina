# gestao_oficina/views.py

from .models import Cliente, Veiculo, Agendamento # Adicionado Agendamento aqui
from .serializers import ClienteSerializer, VeiculoSerializer, AgendamentoSerializer # Adicionado AgendamentoSerializer aqui
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


# --- VIEWS DE VEICULO COM DRF (JÁ EXISTENTES E CORRETAS) ---
class VeiculoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Veiculo.objects.select_related('cliente').all().order_by('marca', 'modelo')
    serializer_class = VeiculoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class VeiculoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Veiculo.objects.select_related('cliente').all()
    serializer_class = VeiculoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# --- VIEWS DE AGENDAMENTO COM DJANGO REST FRAMEWORK (NOVAS) ---
class AgendamentoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all().order_by('data_agendamento', 'hora_agendamento')
    serializer_class = AgendamentoSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo

class AgendamentoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.select_related('cliente', 'veiculo', 'mecanico_atribuido').all()
    serializer_class = AgendamentoSerializer
    lookup_field = 'pk'
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Exemplo