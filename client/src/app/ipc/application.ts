import { Application } from "../application";

export const handleGetApplicationStatus = () => Application.instance.getStatus();
