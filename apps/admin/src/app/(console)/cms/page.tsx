"use client";

import * as React from "react";
import { ApiError, patch, post, qs, useApi } from "@cbms/api-client";
import {
  Button,
  Chip,
  DataTable,
  Field,
  PageHead,
  Pagination,
  Panel,
  StatCard,
  StatGrid,
  Toolbar,
  date,
  num,
} from "@cbms/ui";
import { ActionResult, Async, Tabs } from "../../../components/common";
import { useConsole } from "../../../components/Shell";
import type { Paged, SitePage, SitePost } from "../../../lib/types";

type Tab = "pages" | "posts";

const PUBLIC_SITE = "http://localhost:4104";

/** "About the Barangay" -> "about-the-barangay" */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function CmsPage() {
  const { can } = useConsole();
  const mayEncode = can("website:encode");

  const [tab, setTab] = React.useState<Tab>("pages");
  const [pagePage, setPagePage] = React.useState(1);
  const [postPage, setPostPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const pageSize = 25;

  const pages = useApi<Paged<SitePage>>(`/cms/pages${qs({ page: pagePage, pageSize })}`);
  const posts = useApi<Paged<SitePost>>(`/cms/posts${qs({ page: postPage, pageSize })}`);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const [pageForm, setPageForm] = React.useState({
    slug: "",
    title: "",
    body: "",
    sortOrder: 0,
    slugTouched: false,
  });
  const [postForm, setPostForm] = React.useState({
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    slugTouched: false,
  });

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post<SitePage>("/cms/pages", {
        slug: pageForm.slug.trim() || slugify(pageForm.title),
        title: pageForm.title.trim(),
        body: pageForm.body.trim(),
        sortOrder: Number(pageForm.sortOrder) || 0,
      });
      setOk(`Page “${pageForm.title.trim()}” created.`);
      setPageForm({ slug: "", title: "", body: "", sortOrder: 0, slugTouched: false });
      setShowNew(false);
      pages.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not create the page.");
    } finally {
      setBusy(false);
    }
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await post<SitePost>("/cms/posts", {
        slug: postForm.slug.trim() || slugify(postForm.title),
        title: postForm.title.trim(),
        body: postForm.body.trim(),
        ...(postForm.excerpt.trim() ? { excerpt: postForm.excerpt.trim() } : {}),
      });
      setOk(`Post “${postForm.title.trim()}” drafted. Publish it when it is cleared.`);
      setPostForm({ slug: "", title: "", excerpt: "", body: "", slugTouched: false });
      setShowNew(false);
      posts.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not create the post.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePage(p: SitePage) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/cms/pages/${p.id}`, { isPublished: !p.isPublished });
      setOk(`“${p.title}” is now ${p.isPublished ? "hidden from" : "live on"} the public site.`);
      pages.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the page.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePost(p: SitePost) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      await patch(`/cms/posts/${p.id}`, {
        isPublished: !p.isPublished,
        ...(p.isPublished ? {} : { publishedAt: new Date().toISOString() }),
      });
      setOk(`“${p.title}” is now ${p.isPublished ? "unpublished" : "live on the public site"}.`);
      posts.reload();
    } catch (err) {
      setError((err as ApiError)?.message ?? "Could not update the post.");
    } finally {
      setBusy(false);
    }
  }

  const pageRows = pages.data?.items ?? [];
  const postRows = posts.data?.items ?? [];
  const livePages = pageRows.filter((p) => p.isPublished).length;
  const livePosts = postRows.filter((p) => p.isPublished).length;

  return (
    <>
      <PageHead
        title="Barangay Website"
        subtitle="The public-facing site: standing pages (Citizen's Charter, officials, contact) and news posts. Nothing here is visible to residents until it is published."
        breadcrumb="Communication"
        parity="Barangay Website"
        actions={
          <>
            <a
              className="cbms-btn"
              href={PUBLIC_SITE}
              target="_blank"
              rel="noreferrer"
              title="Opens the public barangay website in a new tab"
            >
              View the public site →
            </a>
            {mayEncode && (
              <Button variant="primary" onClick={() => setShowNew((v) => !v)}>
                {showNew ? "Close" : tab === "pages" ? "+ New page" : "+ New post"}
              </Button>
            )}
          </>
        }
      />

      <ActionResult error={error} success={ok} />

      <StatGrid>
        <StatCard
          label="Pages live"
          value={num(livePages)}
          hint={`of ${num(pages.data?.total)} standing page(s)`}
          icon="📄"
          tone="green"
        />
        <StatCard
          label="Pages in draft"
          value={num(pageRows.length - livePages)}
          hint="Hidden from the public site"
          icon="🚧"
        />
        <StatCard
          label="Posts live"
          value={num(livePosts)}
          hint={`of ${num(posts.data?.total)} news post(s)`}
          icon="📰"
          tone="green"
        />
        <StatCard
          label="Posts in draft"
          value={num(postRows.length - livePosts)}
          hint="Awaiting clearance to publish"
          icon="📝"
        />
      </StatGrid>

      <Tabs<Tab>
        value={tab}
        onChange={(v) => {
          setTab(v);
          setShowNew(false);
        }}
        tabs={[
          { value: "pages", label: "Pages" },
          { value: "posts", label: "News posts" },
        ]}
      />

      {tab === "pages" && (
        <>
          {showNew && mayEncode && (
            <>
              <Panel title="New page">
                <form onSubmit={createPage}>
                  <div className="adm-form-grid">
                    <Field label="Title">
                      <input
                        className="cbms-input"
                        value={pageForm.title}
                        onChange={(e) =>
                          setPageForm((f) => ({
                            ...f,
                            title: e.target.value,
                            slug: f.slugTouched ? f.slug : slugify(e.target.value),
                          }))
                        }
                        placeholder="Citizen's Charter"
                        required
                      />
                    </Field>
                    <Field label="Slug" hint="The URL segment, e.g. /citizens-charter.">
                      <input
                        className="cbms-input"
                        value={pageForm.slug}
                        onChange={(e) =>
                          setPageForm((f) => ({
                            ...f,
                            slug: slugify(e.target.value),
                            slugTouched: true,
                          }))
                        }
                        required
                      />
                    </Field>
                    <Field label="Sort order" hint="Lower numbers appear first in the site menu.">
                      <input
                        className="cbms-input"
                        type="number"
                        value={pageForm.sortOrder}
                        onChange={(e) =>
                          setPageForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Body">
                    <textarea
                      className="cbms-textarea"
                      value={pageForm.body}
                      onChange={(e) => setPageForm((f) => ({ ...f, body: e.target.value }))}
                      required
                    />
                  </Field>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={busy || !pageForm.title.trim() || !pageForm.body.trim()}
                  >
                    {busy ? "Saving…" : "Create page"}
                  </Button>
                </form>
              </Panel>
              <div style={{ height: 16 }} />
            </>
          )}

          <Panel padded={false}>
            <Toolbar>
              <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>Standing pages</strong>
              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted">{num(pages.data?.total)} page(s)</span>
            </Toolbar>

            <Async loading={pages.loading} error={pages.error}>
              <DataTable
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    render: (p) => <span className="cbms-table__primary">{p.title}</span>,
                  },
                  {
                    key: "slug",
                    header: "Slug",
                    render: (p) => <span className="cbms-table__muted">/{p.slug}</span>,
                  },
                  { key: "sortOrder", header: "Sort", align: "right", render: (p) => p.sortOrder },
                  {
                    key: "isPublished",
                    header: "State",
                    render: (p) =>
                      p.isPublished ? (
                        <Chip tone="green">Published</Chip>
                      ) : (
                        <Chip tone="gray">Draft</Chip>
                      ),
                  },
                  {
                    key: "updatedAt",
                    header: "Updated",
                    render: (p) => date(p.updatedAt),
                  },
                  {
                    key: "action",
                    header: "Action",
                    render: (p) =>
                      mayEncode ? (
                        <Button
                          size="sm"
                          variant={p.isPublished ? "default" : "primary"}
                          disabled={busy}
                          onClick={() => togglePage(p)}
                        >
                          {p.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      ) : (
                        <span className="cbms-table__muted">—</span>
                      ),
                  },
                ]}
                rows={pageRows}
                empty="No pages yet — the public site will fall back to its default sections."
              />
            </Async>

            <Pagination
              page={pagePage}
              pageSize={pageSize}
              total={pages.data?.total ?? 0}
              onPage={setPagePage}
            />
          </Panel>
        </>
      )}

      {tab === "posts" && (
        <>
          {showNew && mayEncode && (
            <>
              <Panel title="New post">
                <form onSubmit={createPost}>
                  <div className="adm-form-grid">
                    <Field label="Title">
                      <input
                        className="cbms-input"
                        value={postForm.title}
                        onChange={(e) =>
                          setPostForm((f) => ({
                            ...f,
                            title: e.target.value,
                            slug: f.slugTouched ? f.slug : slugify(e.target.value),
                          }))
                        }
                        placeholder="Barangay assembly set for October"
                        required
                      />
                    </Field>
                    <Field label="Slug" hint="The URL segment, e.g. /news/barangay-assembly.">
                      <input
                        className="cbms-input"
                        value={postForm.slug}
                        onChange={(e) =>
                          setPostForm((f) => ({
                            ...f,
                            slug: slugify(e.target.value),
                            slugTouched: true,
                          }))
                        }
                        required
                      />
                    </Field>
                  </div>
                  <Field label="Excerpt (optional)" hint="One or two lines shown on the news list.">
                    <input
                      className="cbms-input"
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm((f) => ({ ...f, excerpt: e.target.value }))}
                    />
                  </Field>
                  <Field label="Body">
                    <textarea
                      className="cbms-textarea"
                      value={postForm.body}
                      onChange={(e) => setPostForm((f) => ({ ...f, body: e.target.value }))}
                      required
                    />
                  </Field>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={busy || !postForm.title.trim() || !postForm.body.trim()}
                  >
                    {busy ? "Saving…" : "Create post"}
                  </Button>
                </form>
              </Panel>
              <div style={{ height: 16 }} />
            </>
          )}

          <Panel padded={false}>
            <Toolbar>
              <strong style={{ fontSize: 13.5, color: "var(--cbms-navy)" }}>News posts</strong>
              <div className="cbms-toolbar__spacer" />
              <span className="adm-muted">{num(posts.data?.total)} post(s)</span>
            </Toolbar>

            <Async loading={posts.loading} error={posts.error}>
              <DataTable
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    render: (p) => <span className="cbms-table__primary">{p.title}</span>,
                  },
                  {
                    key: "slug",
                    header: "Slug",
                    render: (p) => <span className="cbms-table__muted">/{p.slug}</span>,
                  },
                  {
                    key: "excerpt",
                    header: "Excerpt",
                    render: (p) =>
                      p.excerpt ? (
                        <span className="cbms-table__muted">
                          {p.excerpt.length > 90 ? `${p.excerpt.slice(0, 90)}…` : p.excerpt}
                        </span>
                      ) : (
                        <span className="cbms-table__muted">—</span>
                      ),
                  },
                  {
                    key: "publishedAt",
                    header: "Published",
                    render: (p) =>
                      p.isPublished ? (
                        date(p.publishedAt ?? p.createdAt)
                      ) : (
                        <Chip tone="gray">Draft</Chip>
                      ),
                  },
                  {
                    key: "action",
                    header: "Action",
                    render: (p) =>
                      mayEncode ? (
                        <Button
                          size="sm"
                          variant={p.isPublished ? "default" : "primary"}
                          disabled={busy}
                          onClick={() => togglePost(p)}
                        >
                          {p.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      ) : (
                        <span className="cbms-table__muted">—</span>
                      ),
                  },
                ]}
                rows={postRows}
                empty="No news posts yet."
              />
            </Async>

            <Pagination
              page={postPage}
              pageSize={pageSize}
              total={posts.data?.total ?? 0}
              onPage={setPostPage}
            />
          </Panel>
        </>
      )}
    </>
  );
}
