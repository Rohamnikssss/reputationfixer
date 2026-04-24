import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Lock, AlertTriangle, ListChecks, Flag } from "lucide-react";
import type { RescuePack } from "@/lib/rescue.functions";
import { cn } from "@/lib/utils";

function CopyBtn({ text }: { text: string }) {
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
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
        </>
      )}
    </Button>
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
        >
          {text}
        </div>
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/70 backdrop-blur-[2px]">
            <Lock className="mb-2 h-5 w-5 text-primary" />
            <p className="mb-3 max-w-[18rem] text-center text-xs text-muted-foreground">
              Unlock warm, firm, private, and checklist replies.
            </p>
            <Button size="sm" onClick={onUnlock}>
              Create free account
            </Button>
          </div>
        )}
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
      <ReplyCard label="Short public reply" badge="Public" text={pack.shortReply} />
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

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-warning" />
            What not to say
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul
            className={cn(
              "space-y-2 text-sm text-foreground/90",
              gated && "select-none blur-sm"
            )}
          >
            {pack.whatNotToSay.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-destructive">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-primary" />
            Owner action checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul
            className={cn(
              "space-y-2 text-sm text-foreground/90",
              gated && "select-none blur-sm"
            )}
          >
            {pack.actionChecklist.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="h-4 w-4 text-muted-foreground" />
            Flag / report guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "text-sm leading-relaxed text-foreground/90",
              gated && "select-none blur-sm"
            )}
          >
            {pack.flagGuidance}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Note: we never promise review removal — Google decides.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
