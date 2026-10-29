// Filtro para registros de teste e mocks de demonstração
export function isTestGuest(nameOrAuthor) {
  if (!nameOrAuthor) return false;
  const n = String(nameOrAuthor).trim().toLowerCase();

  // Lista e padrões de cadastros de teste que não devem poluir a lista nem os presentes
  if (
    n === 'teste' ||
    n === 'teste convidado' ||
    n === 'carlos eduardo' ||
    n === 'mariana silva' ||
    n === 'carlos eduardo (mock inicial)' ||
    n === 'mariana silva (mock inicial)' ||
    n === 'teste mural autor' ||
    n === 'teste tio joão' ||
    n === 'tio marcos' ||
    n.startsWith('teste ') ||
    n.startsWith('teste-') ||
    n.includes('teste mural') ||
    n.includes('teste tio') ||
    n.includes('teste convidado')
  ) {
    return true;
  }
  return false;
}

// Identificador universal para filtrar recados excluídos definitivamente
export function isExcludedOrTestMessage(m) {
  if (!m) return true;
  const author = String(m.author || '').trim().toLowerCase();
  const text = String(m.text || '').trim().toLowerCase();
  const id = String(m.id || '').trim().toLowerCase();

  // Descartar recados de usuários de teste
  if (isTestGuest(author)) {
    return true;
  }

  // Recados marcados como excluídos ou marcadores de controle no banco de dados
  if (
    author.includes('[excluido]') ||
    author.includes('[deleted]') ||
    author.includes('[resolvido]') ||
    text.includes('[excluido]') ||
    text.includes('[deleted]') ||
    text.includes('[restored]')
  ) {
    return true;
  }

  // IDs legados que foram descartados e marcados como removidos
  const legacyRemovedIds = [
    'test1-1789646180102',
    'test-approval-check-1',
    'msg-test-upsert-1789646339583',
    'msg-probe-appr',
    'msg-test-ynyc5q',
    'msg-test-probe-x6ad8',
    'rsvp-probe-mural',
    'rsvp-msg-teste-1789732781327',
    'rsvp-msg-loop-1789732824597',
    'rsvp-msg-eb3220a6-63e4-4fc8-926c-58dc53ade8f1',
    'rsvp-msg-flow-1789732791804',
    'msg-rsvp-probe-mural',
    'msg-teste-1789732781327',
    'msg-loop-1789732824597',
    'msg-eb3220a6-63e4-4fc8-926c-58dc53ade8f1',
    'msg-flow-1789732791804',
  ];
  if (legacyRemovedIds.includes(id)) {
    return true;
  }

  return false;
}
