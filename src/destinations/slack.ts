import { Alert } from '../entities'
import { IncomingWebhook } from '@slack/webhook'
import { KnownBlock } from '@slack/types'

const createSummaryBlock = (
  alertCount: number,
  repositoryName: string,
  repositoryOwner: string,
): KnownBlock => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `You have ${alertCount} vulnerabilities in *${repositoryOwner}/${repositoryName}*`,
    },
  }
}

const createDividerBlock = (): KnownBlock => {
  return {
    type: 'divider',
  }
}

const createAlertBlock = (alert: Alert): KnownBlock => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `
*Package name:* ${alert.packageName}
*Vulnerability Version Range:* ${alert.vulnerability?.vulnerableVersionRange}
*Patched Version:* ${alert.vulnerability?.firstPatchedVersion}
*Severity:* ${alert.advisory?.severity}
*Summary:* ${alert.advisory?.summary}
            `,
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'View Advisory',
        emoji: true,
      },
      style: 'danger',
      url: alert.advisory?.url,
    },
  }
}

export const sendAlertsToSlack = async (
  webhookUrl: string,
  alerts: Alert[],
): Promise<void> => {
  const webhook = new IncomingWebhook(webhookUrl)
  const alertBlocks: KnownBlock[] = []
  for (const alert of alerts) {
    alertBlocks.push(createAlertBlock(alert))
  }
  await webhook.send({
    blocks: [
      createSummaryBlock(
        alerts.length,
        alerts[0].repository.name,
        alerts[0].repository.owner,
      ),
      createDividerBlock(),
      ...alertBlocks,
    ],
    icon_url:
      'https://github.com/kunalnagarco/action-cve/raw/main/icons/ladybug.png',
    username: 'GitHub Action - @kunalnagarco/action-cve',
  })
}