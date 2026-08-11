"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Gera um link wa.me com uma mensagem de convite pré-preenchida para o app.
// Se NEXT_PUBLIC_WHATSAPP_INVITE_NUMBER estiver definido, abre direto no chat
// desse número; caso contrário, abre o seletor de contatos do WhatsApp Web/App.
export function WhatsappInviteButton({ className }: { className?: string }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_INVITE_NUMBER;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://myflow.app";

  const message = `Oi! Estou usando o Myflow para organizar tarefas, estudos, saúde, despesas, lazer e aniversários num só lugar. Dá uma olhada: ${siteUrl}`;

  const href = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button variant="secondary" className={className}>
        <MessageCircle size={16} />
        Convidar pelo WhatsApp
      </Button>
    </a>
  );
}
