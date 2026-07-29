'use client';

import { useMemo, useState } from 'react';
import { EmptyState, Money, Chip } from '@/app/_components/kit/Primitives';
import { DataList, RecoveryBar } from '@/app/_components/kit/Data';
import { FileText, Search } from 'lucide-react';

export default function GuiasTabela({ guias }) {
  const [busca, setBusca] = useState('');
  const [soComGlosa, setSoComGlosa] = useState(false);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return guias.filter((g) => {
      if (soComGlosa && g.glosado <= 0) return false;
      if (!termo) return true;
      return (
        g.numero?.toLowerCase().includes(termo) ||
        g.paciente?.toLowerCase().includes(termo) ||
        g.carteira?.toLowerCase().includes(termo) ||
        g.operadora?.toLowerCase().includes(termo)
      );
    });
  }, [guias, busca, soComGlosa]);

  return (
    <section className="rg-card">
      <div className="rg-toolbar">
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 15, color: 'var(--rg-ink-300)' }} />
          <input
            className="rg-input"
            style={{ paddingLeft: 36, height: 38 }}
            placeholder="Buscar por guia, paciente ou carteirinha"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar guias"
          />
        </div>
        <Chip ativo={soComGlosa} onClick={() => setSoComGlosa((v) => !v)}>
          Com glosa
        </Chip>
      </div>

      <DataList
        colunas={[
          { chave: 'numero', titulo: 'Guia', largura: 110 },
          { chave: 'paciente', titulo: 'Paciente' },
          { chave: 'operadora', titulo: 'Operadora' },
          { chave: 'data', titulo: 'Atendimento', largura: 120 },
          { chave: 'apresentado', titulo: 'Apresentado', alinhar: 'right', render: (l) => <Money valor={l.apresentado} tam="sm" /> },
          { chave: 'pago', titulo: 'Pago', alinhar: 'right', render: (l) => <Money valor={l.pago} tam="sm" cor="var(--rg-recuperado-h)" /> },
          { chave: 'glosado', titulo: 'Glosado', alinhar: 'right', render: (l) => <Money valor={l.glosado} tam="sm" cor="var(--rg-glosado)" /> },
          { chave: 'divisao', titulo: 'Divisão', largura: 120, render: (l) => <RecoveryBar sm pago={l.pago} recuperavel={l.glosado} perdido={0} /> },
        ]}
        mobile={{
          titulo: (l) => `Guia ${l.numero}`,
          sub: (l) => `${l.paciente} · ${l.operadora}`,
          status: (l) => (l.glosado > 0 ? 'glosado' : 'processado'),
          meta: [
            { rotulo: 'Apresentado', valor: (l) => <Money valor={l.apresentado} tam="sm" /> },
            { rotulo: 'Pago', valor: (l) => <Money valor={l.pago} tam="sm" /> },
            { rotulo: 'Glosado', valor: (l) => <Money valor={l.glosado} tam="sm" /> },
            { rotulo: 'Atendimento', valor: (l) => l.data },
          ],
          barra: (l) => ({ pago: l.pago, recuperavel: l.glosado, perdido: 0 }),
        }}
        linhas={lista}
        vazio={
          <EmptyState
            icone={FileText}
            titulo={guias.length === 0 ? 'Nenhuma guia encontrada' : 'Nada com esses filtros'}
            texto={
              guias.length === 0
                ? 'Envie um demonstrativo para ver as guias auditadas aqui.'
                : 'Ajuste a busca ou desmarque o filtro de glosa.'
            }
          />
        }
      />
    </section>
  );
}
