import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Search, 
  FileText, 
  Trash2, 
  Sparkles, 
  Eye, 
  FileCode, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle, 
  Loader2,
  X
} from "lucide-react";
import { api } from "../../utils/api";

export const Files = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(localStorage.getItem("activeWorkspaceId") || "");

  // Upload states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState("");
  
  // File Preview Modal states
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const previewFile = fileList.find((f) => f.id === previewFileId);

  // Extract all tags for filter list
  const allTags = ["All", ...Array.from(new Set(fileList.flatMap((f) => f.tags || [])))];

  useEffect(() => {
    const handleWorkspaceChanged = () => {
      setActiveWorkspaceId(localStorage.getItem("activeWorkspaceId") || "");
    };
    window.addEventListener("activeWorkspaceIdChanged", handleWorkspaceChanged);
    return () => {
      window.removeEventListener("activeWorkspaceIdChanged", handleWorkspaceChanged);
    };
  }, []);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setFileList([]);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/files/${activeWorkspaceId}`);
        const mapped = res.data.map((f: any) => ({
          id: f.id,
          filename: f.original_name || f.filename,
          size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
          mimetype: f.mimetype,
          uploadedAt: new Date(f.created_at).toLocaleDateString(),
          status: "Embedded" as const,
          tags: [f.mimetype.split("/")[1]?.toUpperCase() || "DOC"]
        }));
        setFileList(mapped);
      } catch (err) {
        console.error("Failed to load workspace files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [activeWorkspaceId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspaceId) return;

    setUploadingName(file.name);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspace_id", activeWorkspaceId);

    try {
      const res = await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });

      const uploaded = res.data;
      const newFile = {
        id: uploaded.id,
        filename: uploaded.original_name || uploaded.filename,
        size: `${(uploaded.size / (1024 * 1024)).toFixed(2)} MB`,
        mimetype: uploaded.mimetype,
        uploadedAt: new Date(uploaded.created_at).toLocaleDateString(),
        status: "Embedded" as const,
        tags: [uploaded.mimetype.split("/")[1]?.toUpperCase() || "DOC"]
      };

      setFileList((prev) => [newFile, ...prev]);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.message || "File upload failed.");
    } finally {
      setUploadProgress(null);
      setUploadingName("");
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await api.delete(`/files/${id}`);
      setFileList((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete file:", err);
      alert("Failed to delete file from backend server.");
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (!mimetype) return <FileText className="h-5 w-5 text-[#f17463]" />;
    if (mimetype.includes("pdf")) return <FileText className="h-5 w-5 text-[#f17463]" />;
    if (mimetype.includes("csv") || mimetype.includes("sheet")) return <FileSpreadsheet className="h-5 w-5 text-[#f17463]" />;
    if (mimetype.includes("image")) return <ImageIcon className="h-5 w-5 text-blue-400" />;
    return <FileCode className="h-5 w-5 text-teal-400" />;
  };

  const filteredFiles = fileList.filter((file) => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || file.tags.includes(selectedTag);
    const matchesStatus = selectedStatus === "All" || file.status === selectedStatus;
    return matchesSearch && matchesTag && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 select-none h-full">
      {/* File Preview Modal */}
      {previewFileId && previewFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <div className="flex items-center gap-2">
                {getFileIcon(previewFile.mimetype)}
                <h3 className="text-sm font-bold text-[var(--dash-text)] truncate max-w-[240px]">{previewFile.filename}</h3>
              </div>
              <button 
                onClick={() => setPreviewFileId(null)}
                className="p-1 rounded bg-[var(--dash-hover)] border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated text preview content */}
            <div className="mt-5 bg-[var(--dash-hover)] p-4 rounded-xl text-xs font-mono text-[var(--dash-muted)] h-64 overflow-y-auto leading-relaxed border border-[var(--dash-border)] select-text">
              <span className="text-[#f17463] block mb-2">// Parsed Document Semantics Context</span>
              {previewFile.filename.includes("api") ? (
                `API SPECIFICATION V3:\n\nGET /api/auth/me -> Returns user payload\nPOST /api/agents/run -> Body: {message, workspace_id}\n\nRate Limiter Config:\nLimits requests by IP to 100 requests per 15 minute sliding window.\nRedis storage keys allocated at namespace 'rate-limit-ops'.`
              ) : previewFile.filename.includes("competitor") ? (
                `COMPETITOR AUDIT GRID:\n\nCompetitor A: $99/mo standard tier, no visual workflows builder.\nCompetitor B: $49/mo agent tier, limit of 3 custom agent instances.\nCognify Proposed: FREE core, $79/mo PRO (Unlimited custom agents, Stripe portals).`
              ) : (
                `WORKSPACE DOCUMENT METADATA:\n\nFile Name: ${previewFile.filename}\nType: ${previewFile.mimetype}\nSize: ${previewFile.size}\nStatus: ${previewFile.status}\n\nParsed sentences split into chunks. Vector embedding generated using LLM text embedding pipelines. Cosine similarity thresholds active at 0.72.`
              )}
            </div>

            <div className="flex items-center justify-between mt-6 text-[10px] text-neutral-550 font-semibold border-t border-[var(--dash-border)] pt-4">
              <span>Embedding Vector ID: emb-{previewFile.id}</span>
              <span className="text-[#f17463]">Tokens Generated: ~4,200</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-left">
        <span className="text-[10px] text-[#22D3EE] font-bold uppercase tracking-[0.08em] block mb-1">ACTIVE WORKSPACE</span>
        <h1 className="text-[28px] font-bold text-[var(--dash-text)] tracking-tight leading-none">
          Knowledge Base Directory
        </h1>
        <p className="text-sm text-[var(--dash-muted2)] mt-2">
          Upload and index documents. Parsed texts are split, embedded, and injected as agent context nodes.
        </p>
      </div>

      {/* Main Grid: Upload left, list on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start flex-1 overflow-hidden">
        {/* Left Column: Drag & Drop File Upload Box */}
        <div className="dash-card rounded-2xl p-5 flex flex-col gap-4 text-left">
          <h2 className="text-base font-bold text-[var(--dash-text)] border-b border-[var(--dash-border)] pb-3 leading-none flex items-center gap-1.5">
            <UploadCloud className="h-4.5 w-4.5 text-[#22D3EE]" />
            Upload Core Knowledge
          </h2>

          {/* Interactive Upload Input Box */}
          <div className="border-2 border-dashed border-[var(--dash-border)] hover:border-[rgba(34,211,238,0.3)] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[var(--dash-hover)] hover:bg-[rgba(34,211,238,0.05)] relative group">
            <input
              type="file"
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploadProgress !== null}
            />
            <UploadCloud className="h-10 w-10 text-[var(--dash-muted2)] group-hover:text-[#22D3EE] transition-colors" />
            <p className="text-xs font-bold text-[var(--dash-text)] mt-3">Click or Drag & Drop File</p>
            <p className="text-[10px] text-[var(--dash-muted)] mt-1 leading-normal">Supports PDF, CSV, and markdown up to 25MB</p>
          </div>

          {/* Supported formats grid */}
          <div className="grid grid-cols-2 gap-2 mt-1 text-[11px]">
            {[
              { format: "PDF", limit: "up to 25MB" },
              { format: "CSV", limit: "up to 25MB" },
              { format: "DOCX", limit: "up to 10MB" },
              { format: "JSON / MD", limit: "up to 5MB" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-2 rounded-lg bg-[var(--dash-card-bg)] border border-[var(--dash-border)]">
                <span className="font-mono font-bold text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--dash-card-bg)] text-[var(--dash-muted)] border border-[var(--dash-border)]">{item.format}</span>
                <span className="text-[var(--dash-muted)] font-medium">{item.limit}</span>
              </div>
            ))}
          </div>

          {/* Upload progress state */}
          {uploadProgress !== null && (
            <div className="p-4 border border-[var(--cyan-border)] bg-[var(--cyan-dim)] rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-[var(--text0)]">
                <span className="truncate max-w-[150px]">{uploadingName}</span>
                <span className="text-[#22D3EE] font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[var(--dash-hover)] h-1 rounded-full overflow-hidden">
                <div className="h-full bg-[#22D3EE] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-[11px] text-[#22D3EE] font-semibold flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                {uploadProgress <= 25 ? "Parsing text..." :
                 uploadProgress <= 50 ? "Splitting chunks..." :
                 uploadProgress <= 75 ? "Generating embeddings..." : "Indexed ✓"}
              </p>
            </div>
          )}
        </div>

        {/* Right Columns (Span 2): Document Listing */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
          {/* Filters Bar */}
          <div className="dash-card rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="flex items-center bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--dash-muted)] w-full sm:max-w-xs focus-within:border-[rgba(34,211,238,0.3)] transition-all">
              <Search className="h-4 w-4 mr-2 text-[var(--dash-muted2)]" />
              <input
                type="text"
                placeholder="Search file catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[var(--dash-text)] w-full placeholder-neutral-400 focus:ring-0"
              />
            </div>

            {/* Selector Filters */}
            <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-bold text-[var(--dash-muted)]">
              {/* Tag Selector */}
              <div className="flex items-center gap-1.5">
                <span>Category:</span>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-lg px-2 py-1 text-xs text-[var(--dash-text)] outline-none cursor-pointer"
                >
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5">
                <span>Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-lg px-2 py-1 text-xs text-[var(--dash-text)] outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Embedded">Embedded</option>
                  <option value="Indexing">Indexing</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Storage usage bar */}
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-3.5 flex flex-col gap-2 text-left shadow-sm">
            <div className="flex justify-between text-xs font-medium text-[var(--dash-muted)]">
              <span>Storage used</span>
              <span className="font-mono text-[var(--dash-text)] font-bold">2.4 MB of 500 MB</span>
            </div>
            <div className="w-full bg-[var(--dash-hover)] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#22D3EE] rounded-full" style={{ width: `${(2.4 / 500) * 100}%` }}></div>
            </div>
          </div>

          {/* Files List catalog container */}
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[440px] pr-1 select-none">
            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-8 shadow-sm">
                <Search className="h-8 w-8 text-[var(--dash-muted2)] mb-2" />
                <h3 className="text-sm font-semibold text-[var(--dash-muted)]">No matching documents found.</h3>
                <p className="text-xs text-[var(--dash-muted2)] mt-1">Modify filters or upload a new file.</p>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-lg p-4 flex flex-col gap-2.5 hover:bg-[var(--dash-hover)] group transition-all text-left"
                >
                  {/* Row 1 */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="h-8 w-8 rounded-lg bg-[var(--dash-hover)] flex items-center justify-center shrink-0 border border-[var(--dash-border)]/40">
                        {file.filename.endsWith(".pdf") ? (
                          <FileText className="h-4.5 w-4.5 text-[#dc2626]" />
                        ) : file.filename.endsWith(".csv") || file.mimetype.includes("csv") || file.mimetype.includes("sheet") ? (
                          <FileSpreadsheet className="h-4.5 w-4.5 text-[#2d9e6b]" />
                        ) : file.filename.endsWith(".md") || file.filename.endsWith(".txt") ? (
                          <FileText className="h-4.5 w-4.5 text-blue-500" />
                        ) : (
                          <FileText className="h-4.5 w-4.5 text-[#d97706]" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[var(--dash-text)] truncate max-w-[200px] sm:max-w-md">
                        {file.filename}
                      </span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      file.status === "Embedded" 
                        ? "bg-[rgba(45,158,107,0.10)] text-[#2d9e6b] border border-[rgba(45,158,107,0.25)]" 
                        : file.status === "Indexing"
                          ? "bg-[rgba(217,119,6,0.10)] text-[#d97706] border border-[rgba(217,119,6,0.25)]"
                          : "bg-[rgba(220,38,38,0.08)] text-[#dc2626] border border-[rgba(220,38,38,0.15)]"
                    }`}>
                      {file.status === "Indexing" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                      {file.status === "Embedded" && <CheckCircle className="h-2.5 w-2.5" />}
                      {file.status === "Embedded" ? "Ready" : file.status === "Indexing" ? "Embedding" : "Failed"}
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--dash-muted2)]">
                    <span>{file.size}</span>
                    <span>·</span>
                    <span>47 chunks</span>
                    <span>·</span>
                    <span>Uploaded {file.uploadedAt}</span>
                  </div>

                  {/* Row 3 (hover reveal) */}
                  <div className="flex justify-between items-center h-0 overflow-hidden group-hover:h-6 transition-all duration-200 border-t border-[var(--dash-border)] pt-2 mt-0.5">
                    <div className="flex gap-3 text-xs font-semibold">
                      <button 
                        onClick={() => setPreviewFileId(file.id)}
                        className="text-[#22D3EE] hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        View chunks
                      </button>
                      <button 
                        onClick={() => alert(`Re-indexing ${file.filename}...`)}
                        className="text-[var(--dash-muted2)] hover:text-[var(--dash-text)] hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        Re-index
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-[var(--dash-muted2)] hover:text-[#dc2626] bg-transparent border-none cursor-pointer p-0"
                      title="Delete File"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
