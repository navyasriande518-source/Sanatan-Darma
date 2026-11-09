const fs = require("fs");
const os = require("os");
const path = require("path");

const APP_JSON_PATH = path.join(__dirname, "..", "app.json");
const GRAPHQL_URL = "https://api.expo.dev/graphql";

function getAuthHeaders() {
  if (process.env.EXPO_TOKEN) {
    return { authorization: `Bearer ${process.env.EXPO_TOKEN}` };
  }
  try {
    const stateDir = process.env.EXPO_STATE_DIR || path.join(os.homedir(), ".expo");
    const state = JSON.parse(fs.readFileSync(path.join(stateDir, "state.json"), "utf8"));
    if (state?.auth?.sessionSecret) {
      return { "expo-session": state.auth.sessionSecret };
    }
  } catch {
    // Ignore missing state.json
  }
  return null;
}

async function gql(headers, query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(headers || {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return await res.json();
}

function saveAppJson(appJson, { projectId, owner, slug }) {
  appJson.expo = appJson.expo || {};
  if (owner) appJson.expo.owner = owner;
  if (slug) appJson.expo.slug = slug;
  appJson.expo.extra = {
    ...(appJson.expo.extra || {}),
    eas: {
      ...(appJson.expo.extra?.eas || {}),
      projectId,
    },
  };
  fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2) + "\n", "utf8");
}

async function main() {
  let appJson;
  try {
    appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, "utf8"));
  } catch {
    return;
  }

  if (appJson?.expo?.extra?.eas?.projectId) {
    return;
  }

  const headers = getAuthHeaders();
  const envProjectId = process.env.EAS_BUILD_PROJECT_ID;

  if (envProjectId) {
    if (headers) {
      try {
        const byIdRes = await gql(
          headers,
          `query AppById($appId: String!) {
            app {
              byId(appId: $appId) {
                id
                slug
                ownerAccount { name }
              }
            }
          }`,
          { appId: envProjectId }
        );
        const app = byIdRes?.data?.app?.byId;
        if (app?.id) {
          saveAppJson(appJson, {
            projectId: app.id,
            owner: app.ownerAccount?.name || appJson.expo?.owner,
            slug: app.slug || appJson.expo?.slug,
          });
          return;
        }
      } catch {
        // Fall through to saving envProjectId directly
      }
    }
    saveAppJson(appJson, {
      projectId: envProjectId,
      owner: appJson.expo?.owner || "navyasriande518-team",
      slug: appJson.expo?.slug,
    });
    return;
  }

  if (!headers) {
    return;
  }

  const meRes = await gql(
    headers,
    `query CurrentUser {
      meActor {
        __typename
        id
        accounts {
          id
          name
        }
      }
    }`
  );
  const accounts = meRes?.data?.meActor?.accounts || [];
  const preferredOwner = appJson.expo?.owner || "navyasriande518-team";
  const targetAccount =
    accounts.find((a) => a.name === preferredOwner) ||
    (process.env.EAS_BUILD ? accounts[0] : null);

  if (!targetAccount) {
    return;
  }

  const currentSlug = appJson.expo?.slug || "sanatana-dharma-library";

  // 1. Check account apps via appsPaginated
  try {
    const accAppsRes = await gql(
      headers,
      `query AccountApps($accountName: String!) {
        account {
          byName(accountName: $accountName) {
            id
            name
            appsPaginated(first: 50) {
              edges {
                node {
                  id
                  slug
                  githubRepository {
                    metadata {
                      githubRepoName
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      { accountName: targetAccount.name }
    );
    const edges = accAppsRes?.data?.account?.byName?.appsPaginated?.edges || [];
    const apps = edges.map((e) => e?.node).filter(Boolean);
    const repoNames = ["sanathana_darm", "sanatan-darma"];
    const matchedApp =
      apps.find((a) => repoNames.includes(a.githubRepository?.metadata?.githubRepoName?.toLowerCase())) ||
      apps.find((a) => a.slug === currentSlug) ||
      apps.find((a) => a.slug?.toLowerCase().includes("sanat")) ||
      (apps.length === 1 ? apps[0] : null);

    if (matchedApp?.id) {
      saveAppJson(appJson, {
        projectId: matchedApp.id,
        owner: targetAccount.name,
        slug: matchedApp.slug || currentSlug,
      });
      return;
    }
  } catch {
    // Continue to byFullName check
  }

  // 2. Check candidate slugs via app.byFullName
  const candidateSlugs = Array.from(
    new Set([currentSlug, "sanatan-darma", "Sanatan-Darma", "sanathana-darm", "sanathana_darm", "Sanathana_Darm", "sanatana-dharma"])
  );
  for (const slug of candidateSlugs) {
    try {
      const fullRes = await gql(
        headers,
        `query AppByFullName($fullName: String!) {
          app {
            byFullName(fullName: $fullName) {
              id
              slug
            }
          }
        }`,
        { fullName: `@${targetAccount.name}/${slug}` }
      );
      const found = fullRes?.data?.app?.byFullName;
      if (found?.id) {
        saveAppJson(appJson, {
          projectId: found.id,
          owner: targetAccount.name,
          slug: found.slug || slug,
        });
        return;
      }
    } catch {
      // Try next slug
    }
  }

  // 3. Create the app under targetAccount (same mutation as `eas init --account ... --non-interactive`)
  const createRes = await gql(
    headers,
    `mutation CreateAppMutation($appInput: AppInput!) {
      app {
        createApp(appInput: $appInput) {
          id
          slug
        }
      }
    }`,
    {
      appInput: {
        accountId: targetAccount.id,
        projectName: currentSlug,
      },
    }
  );
  const created = createRes?.data?.app?.createApp;
  if (created?.id) {
    saveAppJson(appJson, {
      projectId: created.id,
      owner: targetAccount.name,
      slug: created.slug || currentSlug,
    });
  }
}

main().catch(() => {});
