export const config = {
  slug: "{{APP_SLUG}}",
  appName: "{{APP_NAME}}",
  version: "1.0.0",
  identityPoolId:
    (typeof process !== "undefined" && process.env?.COGNITO_IDENTITY_POOL_ID) || "",
  agentId:
    (typeof process !== "undefined" && process.env?.BEDROCK_AGENT_ID) || "",
  agentAliasId:
    (typeof process !== "undefined" && process.env?.BEDROCK_AGENT_ALIAS_ID) || "",
  description: "{{DESCRIPTION}}",

  requiredGroups: [],

  menu: [
    {
      id: "home",
      label: "Home",
      icon: "home",
      order: 1,
      description: "Home page",
      isDefault: true,
    },
  ],
};

export const { slug, description, menu, appName, version } = config;
export default config;
