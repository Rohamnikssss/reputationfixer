import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RescueInput {
  businessName: string;
  businessType: string;
  reviewText: string;
  starRating: number;
  tone: "apologetic" | "warm" | "firm" | "professional" | "empathetic";
  ownerContext: string;
  managerName: string;
  contactEmail: string;
  contactPhone: string;
}

export function RescueForm({
  onSubmit,
  loading,
  submitLabel = "Fix my review now",
}: {
  onSubmit: (v: RescueInput) => void;
  loading?: boolean;
  submitLabel?: string;
}) {
  const [v, setV] = useState<RescueInput>({
    businessName: "",
    businessType: "Restaurant",
    reviewText: "",
    starRating: 1,
    tone: "professional",
    ownerContext: "",
    managerName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const hasContact = !!(v.contactEmail.trim() || v.contactPhone.trim());
  const disabled =
    loading ||
    !v.businessName.trim() ||
    v.reviewText.trim().length < 5 ||
    !hasContact;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) onSubmit(v);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="biz">Business name</Label>
          <Input
            id="biz"
            placeholder="Nonna's Trattoria"
            value={v.businessName}
            onChange={(e) => setV({ ...v, businessName: e.target.value })}
            required
            maxLength={120}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Business type</Label>
          <Input
            id="type"
            placeholder="Italian restaurant"
            value={v.businessType}
            onChange={(e) => setV({ ...v, businessType: e.target.value })}
            maxLength={80}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review">Review text</Label>
        <Textarea
          id="review"
          rows={5}
          placeholder="Paste the Google review here..."
          value={v.reviewText}
          onChange={(e) => setV({ ...v, reviewText: e.target.value })}
          required
          maxLength={3000}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Star rating</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setV({ ...v, starRating: n })}
                className="p-1"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    n <= v.starRating
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/50"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tone">Desired tone</Label>
          <Select
            value={v.tone}
            onValueChange={(val) =>
              setV({ ...v, tone: val as RescueInput["tone"] })
            }
          >
            <SelectTrigger id="tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apologetic">Apologetic</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="empathetic">Empathetic</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="firm">Firm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div>
          <Label className="text-sm font-medium">Manager contact details</Label>
          <p className="text-xs text-muted-foreground">
            Used in every reply so the AI never leaves a <code>[manager email/phone]</code> placeholder. At least an email or phone is required.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="mgr-name" className="text-xs">Manager name (optional)</Label>
            <Input
              id="mgr-name"
              placeholder="Maria Rossi"
              value={v.managerName}
              onChange={(e) => setV({ ...v, managerName: e.target.value })}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mgr-email" className="text-xs">Email</Label>
            <Input
              id="mgr-email"
              type="email"
              placeholder="manager@nonnas.com"
              value={v.contactEmail}
              onChange={(e) => setV({ ...v, contactEmail: e.target.value })}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mgr-phone" className="text-xs">Phone</Label>
            <Input
              id="mgr-phone"
              type="tel"
              placeholder="+1 555 123 4567"
              value={v.contactPhone}
              onChange={(e) => setV({ ...v, contactPhone: e.target.value })}
              maxLength={60}
            />
          </div>
        </div>
        {!hasContact && (
          <p className="text-xs text-warning">
            Add an email or phone so customers have a real way to reach you.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ctx">Owner context (optional)</Label>
        <Textarea
          id="ctx"
          rows={3}
          placeholder="Anything the AI should know — e.g. 'This complaint is about a bad Saturday night; we're already retraining staff.'"
          value={v.ownerContext}
          onChange={(e) => setV({ ...v, ownerContext: e.target.value })}
          maxLength={1000}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={disabled}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating rescue pack...
          </>
        ) : (
          submitLabel
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        AI outputs are drafts and must be reviewed by the business owner before
        posting.
      </p>
    </form>
  );
}
