import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Lock, AlertTriangle, ListChecks, Flag, Sparkles } from "lucide-react";
import type { RescuePack } from "@/lib/rescue.functions";
import { cn } from "@/lib/utils";
import { CHECKOUT_URLS } from "@/lib/checkout";

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <>
          <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
        </>
      ) : (
        <>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> {label}
        </>
      )}
    </Button>
  );
}

function LockedOverlay({ onUnlock }: { onUnlock?: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-card/75 to-card/95 p-4 text-center backdrop-blur-[2px]">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Lock className="h-4 w-4" />
      </div>
      <p className="max-w-[20rem] text-xs text-muted-foreground">
        Locked — upgrade to unlock.
      </p>
      {onUnlock && (
        <Button size="sm" onClick={onUnlock}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Unlock for $9
        </Button>
      )}
    </div>
  );
}

function ReplyCard({
  label,
  badge,
  text,
  locked,
  onUnlock,
}: {
  label: string;
  badge?: string;
  text: string;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  return (
    <Card className="relative overflow-hidden shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {label}
          {badge ? (
            <Badge variant="secondary" className="text-[10px] uppercase">
              {badge}
            </Badge>
          ) : null}
        </CardTitle>
        {!locked && <CopyBtn text={text} />}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "whitespace-pre-wrap text-sm leading-relaxed text-foreground/90",
            locked && "select-none blur-sm"
          )}
          aria-hidden={locked}
        >
          {text || (locked ? "████████████████████████████████████████████████████████████████████████████████" : "")}
        </div>
        {locked && <LockedOverlay onUnlock={onUnlock} />}
      </CardContent>
    </Card>
  );
}

function ListCard({
  label,
  icon: Icon,
  items,
  markerClass,
  marker,
  locked,
  onUnlock,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  markerClass: string;
  marker: string;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  const copyText = items.map((i) => `${marker} ${i}`).join("\n");
  return (
    <Card className="relative overflow-hidden shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </CardTitle>
        {!locked && items.length > 0 && <CopyBtn text={copyText} />}
      </CardHeader>
      <CardContent>
        <ul
          className={cn(
            "space-y-2 text-sm text-foreground/90",
            locked && "select-none blur-sm"
          )}
          aria-hidden={locked}
        >
          {(locked && items.length === 0
            ? ["████████████████", "████████████", "██████████████████"]
            : items
          ).map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className={markerClass}>{marker}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {locked && <LockedOverlay onUnlock={onUnlock} />}
      </CardContent>
    </Card>
  );
}

function TextCard({
  label,
  icon: Icon,
  text,
  footer,
  locked,
  onUnlock,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  footer?: string;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  return (
    <Card className="relative overflow-hidden shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </CardTitle>
        {!locked && text && <CopyBtn text={text} />}
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-sm leading-relaxed text-foreground/90",
            locked && "select-none blur-sm"
          )}
          aria-hidden={locked}
        >
          {text || (locked ? "█████████████████████████████████████████████████████████████" : "")}
        </p>
        {footer && !locked && (
          <p className="mt-3 text-xs text-muted-foreground">{footer}</p>
        )}
        {locked && <LockedOverlay onUnlock={onUnlock} />}
      </CardContent>
    </Card>
  );
}

export function RescueResult({
  pack,
  gated,
  onUnlock,
}: {
  pack: RescuePack;
  gated?: boolean;
  onUnlock?: () => void;
}) {
  return (
    <div className="space-y-4">
      <ReplyCard label="Short public reply" badge="Public · Free" text={pack.shortReply} />
      <ReplyCard
        label="Warm public reply"
        badge="Public"
        text={pack.warmReply}
        locked={gated}
        onUnlock={onUnlock}
      />
      <ReplyCard
        label="Firm professional reply"
        badge="Public"
        text={pack.firmReply}
        locked={gated}
        onUnlock={onUnlock}
      />
      <ReplyCard
        label="Private customer recovery message"
        badge="Private"
        text={pack.privateMessage}
        locked={gated}
        onUnlock={onUnlock}
      />

      <ListCard
        label="What not to say"
        icon={AlertTriangle}
        items={pack.whatNotToSay}
        marker="✕"
        markerClass="text-destructive"
        locked={gated}
        onUnlock={onUnlock}
      />

      <ListCard
        label="Owner action checklist"
        icon={ListChecks}
        items={pack.actionChecklist}
        marker="✓"
        markerClass="text-primary"
        locked={gated}
        onUnlock={onUnlock}
      />

      <TextCard
        label="Flag / report guidance"
        icon={Flag}
        text={pack.flagGuidance}
        footer="Note: we never promise review removal — Google decides."
        locked={gated}
        onUnlock={onUnlock}
      />
    </div>
  );
}

export function UnlockCTA({ href = CHECKOUT_URLS.starter }: { href?: string }) {
  return (
    <Card className="overflow-hidden border-primary/40 bg-gradient-primary/10 shadow-glow">
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            Unlock full rescue pack — $9 for 10 replies
          </h3>
          <p className="text-sm text-muted-foreground">
            Get every reply, the private recovery message, owner checklist, and flag guidance — for your next 10 reviews.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href={href} target="_blank" rel="noreferrer">
            Unlock for $9
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
