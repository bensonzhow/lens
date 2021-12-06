/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * This file is for the common exports to both `Renderer.K8sApi` and `Main.K8sApi`
 *
 * It would be nicer if we exported this from `Common.K8sApi` but there doesn't seem
 * to be a good way to deprecate an export so that will have to wait.
 */

export {
  ResourceStack,
} from "../common/k8s/resource-stack";
export {
  KubeObjectStore,
} from "../common/k8s-api/kube-object.store";
export {
  forCluster,
  forRemoteCluster,
  KubeApi,
} from "../common/k8s-api/kube-api";
export type {
  BaseKubeApiOptions,
  DeleteResourceDescriptor,
  KubeApiListOptions,
  KubeApiPatchType,
  KubeApiWatchCallback,
  KubeApiWatchOptions,
  PartialKubeObject,
  PropagationPolicy,
  ResourceDescriptor,
} from "../common/k8s-api/kube-api";
export type {
  IKubeWatchEvent,
} from "../common/k8s-api/kube-watch-api";
export {
  KubeObject,
  KubeStatus,
} from "../common/k8s-api/kube-object";
export type {
  KubeStatusData,
} from "../common/k8s-api/kube-object";
export {
  ClusterRole,
  ClusterRoleApi,
  ClusterRoleBinding,
  ClusterRoleBindingApi,
  ConfigMap,
  ConfigMapApi,
  CronJob,
  CronJobApi,
  CustomResourceDefinition,
  CustomResourceDefinitionApi,
  DaemonSet,
  DaemonSetApi,
  Deployment,
  DeploymentApi,
  Endpoint,
  EndpointApi,
  HorizontalPodAutoscaler,
  HorizontalPodAutoscalerApi,
  Ingress,
  IngressApi,
  Job,
  JobApi,
  KubeEvent,
  KubeEventApi,
  LimitRange,
  LimitRangeApi,
  Namespace,
  NamespaceApi,
  NetworkPolicy,
  NetworkPolicyApi,
  Node,
  NodesApi,
  PersistentVolume,
  PersistentVolumeApi,
  PersistentVolumeClaim,
  PersistentVolumeClaimsApi,
  Pod,
  PodDisruptionBudget,
  PodDisruptionBudgetApi,
  PodsApi,
  ReplicaSet,
  ReplicaSetApi,
  ResourceQuota,
  ResourceQuotaApi,
  Role,
  RoleApi,
  RoleBinding,
  RoleBindingApi,
  Secret,
  SecretApi,
  SecretType,
  Service,
  ServiceAccount,
  ServiceAccountApi,
  ServiceApi,
  StatefulSet,
  StatefulSetApi,
  StorageClass,
  StorageClassApi,
} from "../common/k8s-api/endpoints";
export {
  KubeObjectStatusLevel,
} from "./registries/kube-object-status-registry";
export type {
  IKubeApiCluster,
  IKubeApiOptions,
  IKubeApiQueryParams,
  ILocalKubeApiConfig,
  IRemoteKubeApiConfig,
} from "../common/k8s-api/kube-api";
export type {
  KubeObjectConstructor,
  KubeObjectMetadata,
  LabelMatchExpression,
  LabelSelector,
} from "../common/k8s-api/kube-object";
export type {
  AdditionalPrinterColumnsCommon,
  AdditionalPrinterColumnsV1,
  AdditionalPrinterColumnsV1Beta,
  ClusterRoleBindingSubject,
  ClusterRoleBindingSubjectKind,
  ContainerProbe,
  ContainerState,
  ContainerStateRunning,
  ContainerStateTerminated,
  ContainerStateWaiting,
  CRDVersion,
  CustomResourceDefinitionSpec,
  CustomResourceDefinitionStatus,
  EndpointAddress,
  EndpointSubset,
  HpaMetricType,
  IContainerProbe,
  IEndpointAddress,
  IEndpointPort,
  IEndpointSubset,
  IExtensionsBackend,
  IHpaMetric,
  IHpaMetricData,
  IIngressBackend,
  IIngressService,
  ILoadBalancerIngress,
  INetworkingBackend,
  IPodContainer,
  IPodContainerStatus,
  IPodLogsQuery,
  IPolicyEgress,
  IPolicyIngress,
  IPolicyIpBlock,
  IResourceQuotaValues,
  ISecretRef,
  ITargetRef,
  LimitRangeItem,
  NetworkPolicyPeer,
  NetworkPolicyPort,
  NetworkPolicySpec,
  NodeCondition,
  NodeTaint,
  PodMetrics,
  PodStatus,
  PolicyType,
  RoleBindingSubject,
  RoleBindingSubjectKind,
  SecretData,
  ServicePort,
} from "../common/k8s-api/endpoints";
export type {
  Affinity,
  IAffinity,
  IMatchExpression,
  INodeAffinity,
  IPodAffinity,
  IToleration,
} from "../common/k8s-api/workload-kube-object";
export type {
  KubeObjectStatus,
} from "./registries/kube-object-status-registry";
export type {
  JsonApi,
  JsonApiConfig,
  JsonApiData,
  JsonApiError,
  JsonApiErrorParsed,
  JsonApiLog,
  JsonApiParams,
} from "../common/k8s-api/json-api";
export type {
  KubeJsonApi,
  KubeJsonApiData,
  KubeJsonApiDataList,
  KubeJsonApiListMetadata,
  KubeJsonApiMetadata,
} from "../common/k8s-api/kube-json-api";
