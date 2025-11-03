#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TransactionifyStack } from '../lib/transactionify-stack';

const app = new cdk.App();
new TransactionifyStack(app, 'transactionify', {
    description: 'Mocked API stack for code challenges and technical interviews.',
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
