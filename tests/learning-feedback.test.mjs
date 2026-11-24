import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/learning/feedback-input.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports });
const { feedbackInput } = exports;
test('feedback accepts each rating, optional comments and normal conversational text', () => {
  for (const rating of [1,2,3,4,5]) {
    const value = feedbackInput({ rating, helpful: '  Clear explanations.\nThank you!  ', improvement: '' });
    assert.equal(value.rating, rating); assert.equal(value.helpful, 'Clear explanations.\nThank you!'); assert.equal(value.improvement, '');
  }
});
test('feedback rejects malformed ratings and inputs without silently coercing them', () => {
  for (const value of [null, [], 'text', {}, {rating:'5'}, {rating:0}, {rating:6}, {rating:2.5}, {rating:NaN}]) assert.throws(() => feedbackInput(value));
});
test('feedback bounds text without corrupting ordinary Unicode and line breaks', () => {
  assert.equal(feedbackInput({rating:5,helpful:'é'.repeat(2000),improvement:'Useful 👏'}).helpful.length,2000);
  for (const helpful of ['a'.repeat(2001), '\u0000', {}, null]) assert.throws(() => feedbackInput({rating:5, helpful, improvement:''}));
  assert.throws(() => feedbackInput({rating:5,helpful:'',improvement:20}));
});
