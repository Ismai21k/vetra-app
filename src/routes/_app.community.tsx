import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Chips, PageHeader, TextArea } from "@/components/vetra";
import { useAuth } from "@/lib/auth";
import { useDelete, useInsert, useList, useProfile } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/community")({
  head: () => ({ meta: [{ title: "Community — Vetra" }, { name: "description", content: "Ask questions and share experience with other farmers." }] }),
  component: Community,
});

const cats = [{ value: "general", label: "General" }, { value: "question", label: "Question" }, { value: "tip", label: "Tip" }];

function Community() {
  const { t } = useT();
  const { session } = useAuth();
  const profile = useProfile();
  const posts = useList("community_posts");
  const ins = useInsert("community_posts");
  const del = useDelete("community_posts");
  const [body, setBody] = useState("");
  const [cat, setCat] = useState("question");

  const post = async () => {
    if (!body.trim()) return;
    await ins.mutateAsync({ body: body.trim(), category: cat, author_name: profile.data?.full_name ?? "Farmer" });
    setBody("");
    toast.success("Posted");
  };

  return (
    <>
      <PageHeader back title={t("community")} />
      <div className="space-y-4 px-4 pt-4">
        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Posts are opinions from other farmers, not professional advice. For sick animals, contact a vet.</p>
        <div className="card-soft space-y-3 p-3">
          <Chips value={cat} onChange={setCat} options={cats} />
          <TextArea maxLength={2000} placeholder="Ask a question or share a tip…" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button className="w-full" disabled={!body.trim() || ins.isPending} onClick={post}>Post</Button>
        </div>
        {posts.data?.map((p) => (
          <div key={p.id} className="card-soft p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{p.author_name ?? "Farmer"} <span className="font-normal text-muted-foreground">· {cats.find((c) => c.value === p.category)?.label}</span></p>
              {p.user_id === session?.user.id ? (
                <button aria-label="Delete post" className="grid h-9 w-9 place-items-center text-muted-foreground" onClick={() => del.mutate(p.id)}><Trash2 className="h-4 w-4" /></button>
              ) : (
                <button aria-label="Report post" className="grid h-9 w-9 place-items-center text-muted-foreground" onClick={() => toast("Thanks — reporting will be reviewed once moderation is set up.")}><Flag className="h-4 w-4" /></button>
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap">{p.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
        ))}
        {posts.isSuccess && posts.data.length === 0 && <p className="text-center text-sm text-muted-foreground">Be the first to post.</p>}
      </div>
    </>
  );
}
