import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            paragraphs = []
            for p in tree.findall('.//w:p', ns):
                texts = [node.text for node in p.findall('.//w:t', ns) if node.text]
                if texts:
                    paragraphs.append(''.join(texts))
            return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading {path}: {str(e)}"

print("============== DOC 1 ==============")
print(read_docx(r"c:\Users\aashu\OneDrive\Documents\Me\Cestrix Learning\Details\🏢 Cestrix Learning 2.docx"))
print("============== DOC 2 ==============")
print(read_docx(r"c:\Users\aashu\OneDrive\Documents\Me\Cestrix Learning\Details\Cestrix Learning.docx"))
