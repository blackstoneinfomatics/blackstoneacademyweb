export type PortalRole = string;

export type Feature = {
  id: string;
  portalName: PortalRole;
  viewType: "Module List" | "Feature List";
  name: string;
  parentModule: string;
  childModule: string;
  description: string;
  addedOn: string;
  enabled: boolean;
};
