/*
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const uniqueColumns = ga4.deviceUniqueColumns;

publish("device_type", {
  type: "incremental",
  schema: functions.baseSchema("ga4"),
  description: "Device dimension",
  uniqueKey: uniqueColumns,
  bigquery: {
  partitionBy: "DATE(created_ts)",
  clusterBy: ["device_type_id"]
  },
  tags: ['ga4']
  }).query(ctx => `
  WITH source AS (
    SELECT
      ${uniqueColumns}
    FROM ${ctx.ref("ga4_events")}
    WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      ${ctx.when(ctx.incremental(), `
        AND event_date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                          AND CURRENT_DATE()
      `)}
  )

  SELECT
    GENERATE_UUID() AS device_type_id,
    source.*,
    CURRENT_TIMESTAMP() AS created_ts
  FROM source
  GROUP BY ${uniqueColumns}
`);
