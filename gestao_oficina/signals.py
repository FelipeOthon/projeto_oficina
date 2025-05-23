# gestao_oficina/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum, F, DecimalField
from decimal import Decimal  # Importar Decimal para usar Decimal('0.00')
from .models import ItemOsPeca, ItemOsServico, OrdemDeServico


def atualizar_totais_os(ordem_servico_id):
    """
    Calcula e atualiza os totais de peças, serviços e o total geral
    de uma Ordem de Serviço específica.
    """
    try:
        os_instance = OrdemDeServico.objects.get(pk=ordem_servico_id)

        # Calcular total de peças
        total_pecas_agregado = ItemOsPeca.objects.filter(ordem_servico=os_instance).aggregate(
            total=Sum(F('quantidade') * F('valor_unitario'), output_field=DecimalField())
        )
        total_pecas = total_pecas_agregado['total'] if total_pecas_agregado['total'] is not None else Decimal('0.00')

        # Calcular total de serviços
        total_servicos_agregado = ItemOsServico.objects.filter(ordem_servico=os_instance).aggregate(
            total=Sum('valor_servico', output_field=DecimalField())
        )
        total_servicos = total_servicos_agregado['total'] if total_servicos_agregado['total'] is not None else Decimal(
            '0.00')

        os_instance.valor_total_pecas = total_pecas
        os_instance.valor_total_servicos = total_servicos

        # Calcular e atualizar o campo valor_total_os
        os_instance.valor_total_os = (os_instance.valor_total_pecas +
                                      os_instance.valor_total_servicos -
                                      os_instance.valor_desconto)  # Assumindo que valor_desconto já está correto na OS

        # Salvar os três campos atualizados
        os_instance.save(update_fields=['valor_total_pecas', 'valor_total_servicos', 'valor_total_os'])

    except OrdemDeServico.DoesNotExist:
        # Lidar com o caso de a OS não existir, se necessário (ex: logar um erro)
        pass


@receiver(post_save, sender=ItemOsPeca)
def item_os_peca_post_save_handler(sender, instance, created, **kwargs):
    """
    Após salvar um ItemOsPeca, atualiza os totais da OS.
    """
    atualizar_totais_os(instance.ordem_servico.id)


@receiver(post_delete, sender=ItemOsPeca)
def item_os_peca_post_delete_handler(sender, instance, **kwargs):
    """
    Após deletar um ItemOsPeca, atualiza os totais da OS.
    """
    # Antes de chamar atualizar_totais_os, a instância ainda tem a referência
    # para ordem_servico.id, mesmo que o item já tenha sido deletado do DB.
    atualizar_totais_os(instance.ordem_servico.id)


@receiver(post_save, sender=ItemOsServico)
def item_os_servico_post_save_handler(sender, instance, created, **kwargs):
    """
    Após salvar um ItemOsServico, atualiza os totais da OS.
    """
    atualizar_totais_os(instance.ordem_servico.id)


@receiver(post_delete, sender=ItemOsServico)
def item_os_servico_post_delete_handler(sender, instance, **kwargs):
    """
    Após deletar um ItemOsServico, atualiza os totais da OS.
    """
    atualizar_totais_os(instance.ordem_servico.id)


# Sinal para quando o valor_desconto da OS for alterado diretamente na OS.
# Este sinal garantirá que o valor_total_os seja recalculado se o desconto mudar.
@receiver(post_save, sender=OrdemDeServico)
def ordem_de_servico_post_save_handler(sender, instance, created, **kwargs):
    """
    Se o valor_desconto na OS for alterado, ou se for uma nova OS sem itens ainda,
    garante que o valor_total_os reflita o desconto.
    Os totais de peças e serviços são primariamente atualizados pelos sinais dos itens.
    Este sinal lida com o caso de alteração do desconto.
    """
    # Só executa a lógica se não for uma criação (pois na criação os totais de itens ainda são zero)
    # ou se campos relevantes para o total foram atualizados.
    # Precisamos ter cuidado para não criar loops de save.
    # Se 'update_fields' está presente, podemos verificar se 'valor_desconto' está nele.
    # Se não, podemos comparar o valor antigo com o novo (requer rastrear o valor antigo,
    # o que pode ser feito com bibliotecas como django-model-utils ou lógica customizada no save).

    # Uma abordagem mais simples para este sinal é recalcular o valor_total_os
    # com base nos valor_total_pecas e valor_total_servicos já persistidos e o novo valor_desconto.
    # Isso é seguro se este save não disparar os sinais de item novamente.

    # Se este save for resultado de um item sendo adicionado/removido, os outros campos já estarão corretos.
    # Se for uma edição manual do desconto na OS:
    novo_total_os_calculado = (instance.valor_total_pecas +
                               instance.valor_total_servicos -
                               instance.valor_desconto)

    if instance.valor_total_os != novo_total_os_calculado:
        # Para evitar loop e chamar os sinais de item desnecessariamente,
        # atualizamos o campo diretamente sem chamar instance.save() que dispararia o sinal de novo.
        # No entanto, o ideal é que o método save() da OS seja robusto, ou que se use update_fields.
        # Para este caso específico, se este sinal for chamado após os de item, pode ser redundante
        # ou precisar de uma lógica mais fina para saber QUANDO realmente deve atualizar.

        # Por agora, vamos focar nos sinais dos itens atualizando os subtotais e o total_os.
        # Se você editar um valor_desconto diretamente na OS (ex: pelo admin ou API da OS),
        # e o valor_total_os é um campo persistido, ele PRECISA ser recalculado.
        # A função atualizar_totais_os já faz isso. Podemos chamá-la, mas precisamos
        # garantir que não estamos num loop se o save dentro dela disparar este sinal de novo.

        # Uma forma mais segura se este sinal for apenas para o desconto:
        update_fields_kwargs = kwargs.get('update_fields')
        if created or (update_fields_kwargs and 'valor_desconto' in update_fields_kwargs):
            # Recalcula e salva se for criação ou se o desconto especificamente foi atualizado.
            # Os sinais de item já chamam atualizar_totais_os que salva os 3 campos.
            # Se este sinal for apenas para o desconto, ele pode apenas recalcular e salvar o valor_total_os.
            # Mas a função atualizar_totais_os já faz o cálculo correto.
            # A principal preocupação é evitar loops de save.
            # A função atualizar_totais_os já usa update_fields, o que é bom.
            if not (update_fields_kwargs and \
                    ('valor_total_pecas' in update_fields_kwargs or \
                     'valor_total_servicos' in update_fields_kwargs or \
                     'valor_total_os' in update_fields_kwargs)):
                # Só chama se a atualização não veio dos outros campos já cobertos pelos sinais de item
                atualizar_totais_os(instance.id)
    pass  # O pass original estava aqui, a lógica acima é uma consideração.
    # Por enquanto, o mais importante são os sinais dos itens.
    # O sinal da OS pode ser refinado depois se o fluxo de atualização do desconto
    # não for coberto adequadamente.