"use server";

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");

  void title;
  void content;
}
