import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload, FileIcon, ExternalLink, Trash2, Loader2 } from "lucide-react";
import {
  createSignedUploadUrl,
  finalizeUpload,
  updateAsset,
  listMedia,
  getAssetSignedUrl,
  deleteAsset,
} from "@/lib/media.functions";
import { useAuth } from "@/hooks/use-auth";

type Asset = {
  id: string;
  original_name: string;
  size_bytes: number;
  tags: string[];
  created_at: string;
};

const MAX_BYTES = 100 * 1024 * 1024;

function humanSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

interface Props {
  deliverableKey: string;
  deliverableLabel: string;
  group: string;
  block: number;
  onFirstUpload?: () => void;
}

export function DeliverableDropzone({
  deliverableKey,
  deliverableLabel,
  group,
  block,
  onFirstUpload,
}: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const createSignedFn = useServerFn(createSignedUploadUrl);
  const finalizeFn = useServerFn(finalizeUpload);
  const updateFn = useServerFn(updateAsset);
  const listFn = useServerFn(listMedia);
  const getUrlFn = useServerFn(getAssetSignedUrl);
  const deleteFn = useServerFn(deleteAsset);

  // One shared key per user — React Query dedupes calls across the 15 dropzones.
  const userId = user?.id ?? null;
  const sharedKey = ["companion-user-media", userId];

  const mediaQ = useQuery({
    enabled: !!userId,
    queryKey: sharedKey,
    queryFn: () =>
      listFn({
        data: {
          scope: "user" as const,
          ownerUserId: userId!,
          folderId: undefined,
          collectionId: null,
          mediaType: null,
          search: null,
        },
      }),
  });

  const tag = `deliverable:${deliverableKey}`;
  const files = ((mediaQ.data?.assets ?? []) as Asset[]).filter((a) =>
    (a.tags ?? []).includes(tag),
  );

  async function uploadFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0 || !userId) return;
    setUploading(true);
    const wasEmpty = files.length === 0;
    let uploadedCount = 0;
    for (const file of Array.from(list)) {
      try {
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: exceeds 100MB`);
          continue;
        }
        const { uploadUrl, asset } = await createSignedFn({
          data: {
            scope: "user",
            ownerUserId: userId,
            folderId: null,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
          },
        });
        const put = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!put.ok) throw new Error(`Upload failed: ${put.status}`);
        await finalizeFn({ data: { assetId: asset.id } });
        await updateFn({
          data: {
            id: asset.id,
            tags: [tag, `block:${block}`, group, deliverableLabel].slice(0, 30),
          },
        });
        uploadedCount += 1;
        toast.success(`Uploaded ${file.name}`);
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(false);
    qc.invalidateQueries({ queryKey: ["companion-user-media", userId] });
    qc.invalidateQueries({ queryKey: ["media"] }); // refresh Media Hub too
    if (uploadedCount > 0 && wasEmpty) onFirstUpload?.();
  }

  async function openAsset(id: string) {
    try {
      const { url } = await getUrlFn({ data: { assetId: id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const removeMu = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["companion-user-media", userId] });
      qc.invalidateQueries({ queryKey: ["media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="ml-7 mt-2 space-y-2">
      <label
        onDragOver={(e) => {
          if (!Array.from(e.dataTransfer.types).includes("Files")) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs transition ${
          dragOver
            ? "border-primary bg-primary/10 text-primary"
            : "border-white/10 bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }`}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            uploadFiles(e.target.files);
            if (fileInput.current) fileInput.current.value = "";
          }}
        />
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        <span>
          {uploading
            ? "Uploading…"
            : "Drop file or click to upload — saves to your Media Hub"}
        </span>
      </label>

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.slice(0, 5).map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-md border border-white/5 bg-background/40 px-2 py-1.5 text-xs"
            >
              <FileIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate" title={f.original_name}>
                {f.original_name}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {humanSize(f.size_bytes)}
              </span>
              <button
                type="button"
                onClick={() => openAsset(f.id)}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                title="Open"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove ${f.original_name}?`)) removeMu.mutate(f.id);
                }}
                disabled={removeMu.isPending}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {files.length > 5 && (
            <li className="px-2 text-xs text-muted-foreground">
              + {files.length - 5} more — see all in your Media Hub
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
