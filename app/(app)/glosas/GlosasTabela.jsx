'use client';

import { useMemo, useState } from 'react';
import { EmptyState, Money, Chip, StatusBadge } from '@/app/_components/kit/Primitives';
import { Prazo, BulkBar } from '@/app/_components/kit/Signature';
import { DataList } from '@/app/_components/kit/Data';
import { AlertTriangle } from 'lucide-react';

const FILTROS = [
  { id: 'recorriveis', rotulo: 'Recorríveis' },
  { id: 'urgentes', rotulo: 'Vence em 7 dias' },
  { id: 'enviados', rotulo: 'Recurso enviado' },
  { id: 'vencidos', rotulo: 'Prazo vencido' },
];

export default function GlosasTabela({ glosas }) {
  const [filtro, setFiltro] = useState('recorriveis');
  const [selecionadas, setSelecionadas] = useState(() => new Set());

  const lista = useMemo(() => {
    switch (filtro) {
      case 'recorriveis':
        return glosas.filter((g) => g.status === 'recorrivel');
      case 'urgentes':
        return glosas.filter((g) => g.status === 'recorrivel' && g.prazo != null && g.prazo <= 7);
      case 'enviados':
        return glosas.filter((g) => g.status === 'enviado');
      case 'vencidos':
        return glosas.filter((g) => g.status === 'perdido');
      default:
        return glosas;
    }
  }, [glosas, filtro]);

  function alternar(id) {
    setSelecionadas((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  const visiveisSelecionadas = lista.filter((g) => selecionadas.has(g.id));
  const valorSelecionado = visiveisSelecionadas.reduce((s, g) => s + g.valor, 0);

  return (
    <>
      <section className="rg-card">
        <div className="rg-toolbar">
          {FILTROS.map((f) => (
            <Chip key={f.id} ativo={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.rotulo}
            </Chip>
          ))}
        </div>

        <DataList
          colunas={[
            {
              chave: 'sel', titulo: '', largura: 36,
              render: (l) => (
                <input
                  type="checkbox"
                  className="rg-check"
                  checked={selecionadas.has(l.id)}
                  onChange={() => alternar(l.id)}
                  aria-label={`Selecionar glosa da guia ${l.guia}`}
                />
              ),
            },
            { chave: 'guia', titulo: 'Guia', largura: 100 },
            { chave: 'procedimento', titulo: 'Procedimento' },
            { chave: 'motivo', titulo: 'Motivo da glosa' },
            { chave: 'operadora', titulo: 'Operadora' },
            { chave: 'prazo', titulo: 'Prazo', largura: 96, render: (l) => <Prazo dias={l.prazo} total={90} /> },
            { chave: 'valor', titulo: 'Recuperável', alinhar: 'right', render: (l) => <Money valor={l.valor} tam="sm" cor="var(--rg-glosado)" /> },
            { chave: 'status', titulo: 'Status', render: (l) => <StatusBadge status={l.status} /> },
          ]}
          mobile={{
            titulo: (l) => l.procedimento,
            sub: (l) => `Guia ${l.guia} · ${l.operadora}`,
            status: (l) => l.status,
            meta: [
              { rotulo: 'Recuperável', valor: (l) => <Money valor={l.valor} tam="sm" /> },
              { rotulo: 'Prazo', valor: (l) => <Prazo dias={l.prazo} total={90} /> },
              { rotulo: 'Motivo', valor: (l) => l.motivo },
            ],
          }}
          linhas={lista}
          vazio={
            <EmptyState
              icone={AlertTriangle}
              titulo={glosas.length === 0 ? 'Nenhuma glosa no período' : 'Nada neste filtro'}
              texto={
                glosas.length === 0
                  ? 'Quando a operadora glosar algum item, ele aparece aqui com o motivo e o prazo.'
                  : 'Troque o filtro acima para ver as outras glosas.'
              }
            />
          }
        />
      </section>

      {selecionadas.size > 0 && (
        <BulkBar
          n={visiveisSelecionadas.length}
          valor={valorSelecionado}
          rotulo="Gerar recursos"
          onLimpar={() => setSelecionadas(new Set())}
        />
      )}
    </>
  );
}
